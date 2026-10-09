// Sid'note : fonction "horaire"
// Relais qui lit le lien iCal de l'horaire (ex. UMons) pour l'app.
// Le navigateur ne peut pas lire ce lien directement : le site de l'université le bloque.
// Seuls les utilisateurs connectés à Sid'note peuvent s'en servir.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const fail = (msg: string, status: number) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // 1) l'utilisateur doit être connecté à Sid'note
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data?.user) return fail("Non connecté", 401);

  // 2) le lien doit être un lien https (ou webcal) vers un calendrier
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* vide */ }
  let url: URL;
  try { url = new URL(String(body.url || "").trim().replace(/^webcal:/i, "https:")); } catch (_) { return fail("Lien invalide", 400); }
  if (url.protocol !== "https:") return fail("Le lien doit commencer par https://", 400);

  // 3) lecture du calendrier
  let res: Response;
  try {
    res = await fetch(url.href, { headers: { "User-Agent": "Sidnote/1.0 (calendrier)" }, redirect: "follow" });
  } catch (_) { return fail("Impossible de joindre le serveur de l'horaire", 502); }
  if (!res.ok) return fail(`Le serveur de l'horaire a répondu ${res.status}`, 502);
  const text = await res.text();
  if (text.length > 8_000_000) return fail("Calendrier trop volumineux", 413);
  if (!text.includes("BEGIN:VCALENDAR")) return fail("Ce lien ne contient pas de calendrier iCal", 422);

  return new Response(text, { headers: { ...cors, "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
});
