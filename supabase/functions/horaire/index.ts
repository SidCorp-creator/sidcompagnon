// Sid'note : fonction "horaire"
// Relais qui lit le lien iCal de l'horaire (ex. UMons) pour l'app.
// Le navigateur ne peut pas lire ce lien directement : le site de l'université le bloque.
// Seuls les utilisateurs connectés à Sid'note peuvent s'en servir.
// v4 (Sid'compagnon v45) : calendrier privé protégé par identifiant + mot de passe (authentification HTTP Basic, https seulement) ;
// l'identifiant n'est ni gardé ni journalisé ici, il n'est utilisé que pour cette lecture.
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

  // 3) lecture du calendrier (avec identifiant si le calendrier est privé)
  const headers: Record<string, string> = { "User-Agent": "Sidnote/1.0 (calendrier)" };
  const user = String(body.user || ""), pass = String(body.pass || "");
  if (user || pass) {
    if (user.length > 200 || pass.length > 400) return fail("Identifiant trop long", 400);
    const bytes = new TextEncoder().encode(`${user}:${pass}`);
    let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
    headers.Authorization = "Basic " + btoa(bin);
  }
  let res: Response;
  try {
    res = await fetch(url.href, { headers, redirect: user || pass ? "manual" : "follow" });
    // une redirection avec identifiant n'est suivie que vers le même site (l'identifiant n'est jamais envoyé ailleurs)
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const to = new URL(res.headers.get("location")!, url);
      if (to.protocol !== "https:" || to.host !== url.host) return fail("Le calendrier redirige vers un autre site : utilise directement le lien final", 502);
      res = await fetch(to.href, { headers, redirect: "manual" });
    }
  } catch (_) { return fail("Impossible de joindre le serveur du calendrier", 502); }
  if (res.status === 401 || res.status === 403) return fail(user || pass ? "Identifiant ou mot de passe refusé par le calendrier" : "Ce calendrier est privé : ajoute ton identifiant, ou utilise son adresse secrète iCal", 502);
  if (!res.ok) return fail(`Le serveur du calendrier a répondu ${res.status}`, 502);
  const text = await res.text();
  if (text.length > 8_000_000) return fail("Calendrier trop volumineux", 413);
  if (!text.includes("BEGIN:VCALENDAR")) return fail("Ce lien ne contient pas de calendrier iCal", 422);

  return new Response(text, { headers: { ...cors, "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
});
