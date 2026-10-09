// sid'note : fonction "rappels"
// - Appelée chaque matin par le cron (en-tête x-cron-secret) : envoie les rappels J-3, J-2 et J-1.
// - Appelée par l'app avec { test: true } : envoie une notification de test à l'utilisateur connecté.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC = "__VAPID_PUBLIC__";
const VAPID_PRIVATE = "__VAPID_PRIVATE__";
const CRON_SECRET = "__CRON_SECRET__";

webpush.setVapidDetails("https://sidnote.netlify.app", VAPID_PUBLIC, VAPID_PRIVATE);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const QUAND: Record<number, string> = { 1: "Demain" };

// Date du jour à Bruxelles, au format AAAA-MM-JJ
function todayBrussels(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86400000);
}
// Les rappels du jour pour une liste de dates du planning
export function remindersFor(tasks: any[], today: string) {
  const out: { title: string; body: string; tag: string }[] = [];
  for (const t of tasks || []) {
    if (!t || !t.date || !t.title || t.status === "fait") continue;
    const n = daysBetween(today, t.date);
    if (!QUAND[n]) continue;
    const [, m, d] = t.date.split("-").map(Number);
    out.push({
      title: `${QUAND[n]} · ${t.title}`,
      body: `${d} ${MOIS[m - 1]}${t.cat ? " · " + t.cat : ""}${t.end ? " (jusqu'au " + Number(t.end.split("-")[2]) + " " + MOIS[Number(t.end.split("-")[1]) - 1] + ")" : ""}`,
      tag: `${t.id}-${n}`,
    });
  }
  return out;
}

async function sendTo(subs: any[], msgs: any[]) {
  let sent = 0;
  for (const s of subs) {
    for (const m of msgs) {
      try {
        await webpush.sendNotification(s.subscription, JSON.stringify(m), { TTL: 60 * 60 * 12 });
        sent++;
      } catch (err: any) {
        // abonnement expiré ou supprimé : on le retire
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          break;
        }
        console.error("envoi impossible", err && err.statusCode, err && err.body);
      }
    }
  }
  return sent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* corps vide */ }

  // 1) Test depuis l'app : l'utilisateur doit être connecté
  if (body.test) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await db.auth.getUser(jwt);
    if (error || !data?.user) return json({ error: "Non connecté" }, 401);
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", data.user.id);
    if (!subs?.length) return json({ error: "Aucun appareil abonné aux rappels" }, 404);
    const sent = await sendTo(subs, [{ title: "sid'note", body: "Les rappels fonctionnent !", tag: "test" }]);
    return json({ sent });
  }

  // 2) Passage quotidien du cron
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) return json({ error: "Accès refusé" }, 403);
  const today = todayBrussels();
  const { data: subs, error } = await db.from("push_subscriptions").select("*");
  if (error) return json({ error: error.message }, 500);
  const byUser = new Map<string, any[]>();
  for (const s of subs || []) byUser.set(s.user_id, [...(byUser.get(s.user_id) || []), s]);
  if (!byUser.size) return json({ today, sent: 0 });

  const { data: rows, error: e2 } = await db.from("user_data").select("user_id,data").in("user_id", [...byUser.keys()]);
  if (e2) return json({ error: e2.message }, 500);
  let sent = 0;
  for (const r of rows || []) {
    const msgs = remindersFor(r.data?.tasks, today);
    if (msgs.length) sent += await sendTo(byUser.get(r.user_id) || [], msgs);
  }
  return json({ today, users: byUser.size, sent });
});
