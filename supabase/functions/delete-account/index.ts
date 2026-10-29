// Sid'note v35 : fonction "delete-account" : suppression du compte en libre-service (RGPD).
// La personne connectée (jeton de session) supprime elle-même : ses fichiers (bucket « documents », dossier <uid>/),
// ses appareils abonnés aux notifications, son compteur Nutrition, sa ligne de données, puis son compte (auth.users).
// L'app redemande d'abord le mot de passe du compte. Le compte test ne peut pas être supprimé.
// Verify JWT : OFF (la fonction vérifie elle-même le jeton, comme horaire et nutrition).
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const PROTECTED = ["test@sidcorp.app"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

// tous les fichiers d'un dossier, sous-dossiers compris (ex. <uid>/notes/)
async function listAll(prefix: string): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from("documents").list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const f of data || []) {
      const path = `${prefix}/${f.name}`;
      if (f.id) out.push(path); else out.push(...await listAll(path)); // sans id = sous-dossier
    }
    if (!data || data.length < 1000) break;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non permise" }, 405);
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who, error } = await db.auth.getUser(jwt);
  if (error || !who?.user) return json({ error: "Non connecté" }, 401);
  const u = who.user;
  if (PROTECTED.includes(String(u.email || "").toLowerCase())) return json({ error: "Ce compte ne peut pas être supprimé" }, 403);
  try {
    const files = await listAll(u.id);
    for (let i = 0; i < files.length; i += 100) {
      const { error: e } = await db.storage.from("documents").remove(files.slice(i, i + 100));
      if (e) throw e;
    }
    for (const t of ["push_subscriptions", "nutrition_usage", "user_data"]) {
      const { error: e } = await db.from(t).delete().eq("user_id", u.id);
      if (e) throw e;
    }
    const { error: e2 } = await db.auth.admin.deleteUser(u.id);
    if (e2) throw e2;
    return json({ ok: true, files: files.length });
  } catch (ex: any) {
    console.error("suppression impossible", ex?.message || ex);
    return json({ error: "Suppression impossible pour l'instant. Réessaie plus tard." }, 500);
  }
});
