// Sid'note v39 : fonction "rappels" (notifications du planning et des cours du calendrier relié ; la veille toujours active ; FR, EN, NL)
// - Appelée toutes les 5 minutes par le cron (en-tête x-cron-secret) : envoie les rappels dont l'heure est arrivée,
//   selon les délais choisis par chaque personne (Réglages > Notifications : 10 min, 1 h, la veille…).
// - Appelée par l'app avec { test: true } : envoie une notification de test à la personne connectée.
// Secrets Supabase à créer (Edge Functions > Secrets) : VAPID_PUBLIC, VAPID_PRIVATE (valeurs du fichier secrets/vapid.json).
// Le secret du cron est créé tout seul par supabase/sql/notifications.sql (dans le coffre Supabase).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE") || "";
if (VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails("https://sidnote.netlify.app", VAPID_PUBLIC, VAPID_PRIVATE);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// --- rappels : début (fonctions pures, testées par tests/rappels.test.js)
const TZ = "Europe/Brussels";
const DEFAULT_LEADS = [1440]; // la veille, à la même heure
const WINDOW = 15 * 60000; // un rappel en retard de moins de 15 min part quand même (cron en retard)
const MOIS = {
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  nl: ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."],
};

// décalage (ms) entre l'heure de Bruxelles et l'heure UTC à un instant donné
function tzOffset(ms: number): number {
  const p: Record<string, number> = {};
  for (const x of new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ms))) if (x.type !== "literal") p[x.type] = Number(x.value);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}
// « 2026-10-12 » + « 14:30 » (heure de Bruxelles) → instant UTC en ms
function brusselsToUtc(date: string, time: string): number {
  const [y, m, d] = date.split("-").map(Number), [h, mi] = (time || "08:00").split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  const t = guess - tzOffset(guess);
  return guess - tzOffset(t);
}
function cleanLeads(v: unknown): number[] {
  const a = Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 10080) : DEFAULT_LEADS;
  return [...new Set(a)].slice(0, 6);
}
function whenText(lead: number, lang: string): string {
  const en = lang === "en", nl = lang === "nl";
  if (lead < 60) return en ? `In ${lead} min` : nl ? `Over ${lead} min` : `Dans ${lead} min`;
  if (lead < 1440) { const h = Math.round(lead / 60); return en ? `In ${h} h` : nl ? `Over ${h} u` : `Dans ${h} h`; }
  const d = Math.round(lead / 1440);
  if (d === 1) return en ? "Tomorrow" : nl ? "Morgen" : "Demain";
  return en ? `In ${d} days` : nl ? `Over ${d} dagen` : `Dans ${d} jours`;
}
// les rappels à envoyer maintenant pour une personne
export function dueReminders(data: any, now: number) {
  const out: { key: string; title: string; body: string; tag: string }[] = [];
  const prefs = data?.prefs || {}, n = prefs.notif || {};
  if (n.on === false) return out;
  // v39 : la veille est toujours envoyée (demande de Sid), en plus des délais choisis
  const withEve = (a: number[]) => [...new Set([...a, 1440])];
  const leads = withEve(cleanLeads(n.leads)), lang = prefs.lang === "en" ? "en" : prefs.lang === "nl" ? "nl" : "fr";
  for (const t of data?.tasks || []) {
    if (!t || !t.id || !t.title || !/^\d{4}-\d{2}-\d{2}$/.test(t.date || "") || t.status === "fait" || t.canc || t.src === "ical") continue;
    // v23 : chaque activité peut avoir ses propres délais (t.leads) ; v39 : même « aucun rappel » (t.remind === false) garde la veille
    const start = brusselsToUtc(t.date, t.time || "08:00");
    for (const lead of t.remind === false ? [1440] : Array.isArray(t.leads) && t.leads.length ? withEve(cleanLeads(t.leads)) : leads) {
      const at = start - lead * 60000;
      if (now < at || now - at > WINDOW || now > start) continue;
      const [, m, d] = t.date.split("-").map(Number);
      out.push({
        key: `${t.id}|${t.date}|${t.time || ""}|${lead}`,
        title: `${whenText(lead, lang)} · ${t.title}`,
        body: `${t.time ? t.time + " · " : ""}${d} ${MOIS[lang][m - 1]}${t.cat ? " · " + t.cat : ""}`,
        tag: `${t.id}-${lead}`,
      });
    }
  }
  // cours du calendrier relié, copiés par l'app dans data.icalSoon (v39 : mêmes délais que les activités, la veille comprise)
  if (n.ical !== false && Array.isArray(data?.icalSoon)) {
    for (const c of data.icalSoon.slice(0, 200)) {
      if (!c || !c.id || !c.title || !/^\d{4}-\d{2}-\d{2}$/.test(c.date || "")) continue;
      const start = brusselsToUtc(c.date, c.time || "08:00");
      for (const lead of leads) {
        const at = start - lead * 60000;
        if (now < at || now - at > WINDOW || now > start) continue;
        const [, m, d] = c.date.split("-").map(Number);
        out.push({
          key: `ical|${c.id}|${c.date}|${c.time || ""}${lead === 1440 ? "" : "|" + lead}`, // la veille garde l'ancienne clé (pas de doublon)
          title: `${whenText(lead, lang)} · ${c.title}`,
          body: `${c.time ? c.time + " · " : ""}${d} ${MOIS[lang][m - 1]}${c.loc ? " · " + String(c.loc).slice(0, 60) : ""}`,
          tag: `ical-${String(c.id).slice(-36)}-${lead}`,
        });
      }
    }
  }
  return out;
}
// --- rappels : fin

async function sendTo(subs: any[], msgs: any[]) {
  let sent = 0;
  for (const s of subs) {
    for (const m of msgs) {
      try {
        await webpush.sendNotification(s.subscription, JSON.stringify({ title: m.title, body: m.body, tag: m.tag }), { TTL: 60 * 60 });
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

let cronSecret = "";
async function getCronSecret(): Promise<string> {
  if (!cronSecret) {
    const { data, error } = await db.rpc("sidnote_cron_secret");
    if (error) console.error("secret du cron introuvable", error.message);
    cronSecret = (data as string) || "";
  }
  return cronSecret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return json({ error: "Secrets VAPID_PUBLIC / VAPID_PRIVATE manquants" }, 500);
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* corps vide */ }

  // 1) Test depuis l'app : la personne doit être connectée
  if (body.test) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await db.auth.getUser(jwt);
    if (error || !data?.user) return json({ error: "Non connecté" }, 401);
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", data.user.id);
    if (!subs?.length) return json({ error: "Aucun appareil abonné aux notifications" }, 404);
    const sent = await sendTo(subs, [{ title: "Sid'note", body: body.lang === "en" ? "Notifications are working!" : body.lang === "nl" ? "Meldingen werken!" : "Les notifications fonctionnent !", tag: "test" }]);
    return json({ sent });
  }

  // 2) Passage du cron (toutes les 5 minutes)
  const secret = await getCronSecret();
  if (!secret || req.headers.get("x-cron-secret") !== secret) return json({ error: "Accès refusé" }, 403);
  const now = Date.now();
  const { data: subs, error } = await db.from("push_subscriptions").select("*");
  if (error) return json({ error: error.message }, 500);
  const byUser = new Map<string, any[]>();
  for (const s of subs || []) byUser.set(s.user_id, [...(byUser.get(s.user_id) || []), s]);
  if (!byUser.size) return json({ sent: 0 });

  const { data: rows, error: e2 } = await db.from("user_data").select("user_id,data").in("user_id", [...byUser.keys()]);
  if (e2) return json({ error: e2.message }, 500);
  let sent = 0;
  for (const r of rows || []) {
    const due = dueReminders(r.data, now);
    if (!due.length) continue;
    // anti-doublon : on ne garde que les rappels jamais envoyés (la clé est unique dans push_sent)
    const { data: fresh, error: e3 } = await db.from("push_sent")
      .upsert(due.map((m) => ({ key: r.user_id + "|" + m.key })), { onConflict: "key", ignoreDuplicates: true })
      .select("key");
    if (e3) { console.error("push_sent", e3.message); continue; }
    const ok = new Set((fresh || []).map((x: any) => x.key));
    const msgs = due.filter((m) => ok.has(r.user_id + "|" + m.key));
    if (msgs.length) sent += await sendTo(byUser.get(r.user_id) || [], msgs);
  }
  // ménage : on oublie les rappels envoyés il y a plus de 10 jours
  await db.from("push_sent").delete().lt("sent_at", new Date(now - 10 * 86400000).toISOString());
  return json({ users: byUser.size, sent });
});
