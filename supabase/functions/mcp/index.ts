// Sid'note v38-v41 : fonction "mcp" : connecteur Sid'note pour l'IA de chacun (Claude, ChatGPT, Le Chat…) (protocole MCP, transport « Streamable HTTP », réponses JSON).
// Adresse : https://<projet>.supabase.co/functions/v1/mcp/<clé>  — la clé est personnelle (créée dans Réglages > Mon IA),
// seule son empreinte SHA-256 est gardée (table mcp_tokens, supabase/sql/mcp.sql). Verify JWT : OFF.
// Accès : agenda (v41 : avec les rappels), tâches, notes (pas les notes secrètes), nutrition (v39 : c'est l'IA de la personne qui calcule), musculation (v41). Plus de listes partagées (retirées en v41). Jamais les coffres (mots de passe, documents).
// Écriture « à condition » sur user_data (comme push() dans l'app) : si l'app a écrit entre-temps, on relit et on recommence.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id, mcp-protocol-version",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
const rpcOk = (id: unknown, result: unknown) => json({ jsonrpc: "2.0", id, result });
const rpcErr = (id: unknown, code: number, message: string) => json({ jsonrpc: "2.0", id, error: { code, message } });

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const norm = (s: unknown) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
// date du jour à Bruxelles (YYYY-MM-DD)
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
const addDays = (d: string, n: number) => {
  const x = new Date(d + "T12:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const isDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s: unknown) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s);

async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// deno-lint-ignore no-explicit-any
type Data = any;
async function readData(user: string): Promise<{ data: Data; at: string | null }> {
  const { data, error } = await db.from("user_data").select("data, updated_at").eq("user_id", user).maybeSingle();
  if (error) throw error;
  return { data: data?.data || {}, at: data?.updated_at || null };
}
// applique change() aux données puis enregistre, sans écraser une écriture de l'app faite entre-temps
async function writeData(user: string, change: (d: Data) => unknown) {
  for (let i = 0; i < 4; i++) {
    const { data, at } = await readData(user);
    const out = change(data);
    const now = new Date().toISOString();
    if (!at) {
      const { error } = await db.from("user_data").insert({ user_id: user, data, updated_at: now });
      if (!error) return out;
      continue;
    }
    const { data: rows, error } = await db.from("user_data").update({ data, updated_at: now })
      .eq("user_id", user).eq("updated_at", at).select("user_id");
    if (error) throw error;
    if (rows && rows.length) return out;
  }
  throw new Error("Les données ont changé pendant l'enregistrement. Réessaie.");
}

// cours du calendrier relié (lien iCal dans data.prefs.ical) : même lecture que parseICS dans l'app, heure de Bruxelles
const BXL = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
function icsLocal(v: string) {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  if (!m[4]) return { date: `${m[1]}-${m[2]}-${m[3]}`, time: "" };
  if (!m[7]) return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4]}:${m[5]}` }; // heure locale (Bruxelles)
  const p = Object.fromEntries(BXL.formatToParts(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]))).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
async function icalEvents(d: Data, from: string, to: string): Promise<Data[] | null> {
  const raw = d.prefs && d.prefs.ical;
  if (!raw) return [];
  let text = "";
  try {
    const url = new URL(String(raw).trim().replace(/^webcal:/i, "https:"));
    if (url.protocol !== "https:") return null;
    const r = await fetch(url.href, { headers: { "User-Agent": "Sidnote/1.0 (calendrier)" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    text = await r.text();
  } catch { return null; }
  const unesc = (v: string) => v.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
  const out: Data[] = [], seen = new Set<string>();
  let ev: Record<string, string> | null = null;
  for (const line of text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    if (line === "BEGIN:VEVENT") { ev = {}; continue; }
    if (line === "END:VEVENT") {
      const s = ev && ev.DTSTART ? icsLocal(ev.DTSTART) : null;
      if (ev && s && s.date >= from && s.date <= to) {
        const title = unesc(ev.SUMMARY || "Cours").trim();
        const e = ev.DTEND ? icsLocal(ev.DTEND) : null;
        const key = (ev.UID || title) + ev.DTSTART;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ src: "ical", title, date: s.date, time: s.time, timeEnd: e && e.date === s.date && e.time > s.time ? e.time : "", loc: ev.LOCATION ? unesc(ev.LOCATION).trim() : "",
            canc: /CANCELLED/i.test(ev.STATUS || "") || /annul/i.test(title) });
        }
      }
      ev = null; continue;
    }
    if (!ev) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    ev[line.slice(0, i).split(";")[0].toUpperCase()] = line.slice(i + 1);
  }
  return out;
}
const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const dayName = (d: string) => DAYS[new Date(d + "T12:00:00Z").getUTCDay()];

// ---------- nutrition (mêmes formats que l'app : data.nutri.log, menu, weights) ----------
// v39 : ce que les IA notent nourrit la mémoire commune des aliments (pour 100 g, comme avant avec Claude) : la première réponse fait référence
const foldS = (s: string) => String(s || "").replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const FSTOP = new Set(["de", "du", "des", "d", "la", "le", "les", "l", "un", "une", "au", "aux", "of", "the", "a", "an", "some"]);
const foodKey = (s: string) => foldS(s).replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w && !FSTOP.has(w)).map((w) => (w.length > 3 && /[sx]$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w)).join(" ");
async function learnFoods(items: Data[], lang: string) {
  for (const it of items) {
    const g = Number(it.grams), k = foodKey(it.name);
    if (!(g > 0) || !k || !(Number(it.kcal) >= 0)) continue;
    const per = (x: unknown) => Math.round((Number(x) || 0) * 1000 / g) / 10;
    const key = `${lang}:${k}`;
    const { data: old } = await db.from("foods").select("key").eq("key", key).maybeSingle();
    if (!old) await db.from("foods").insert({ key, name: String(it.name).slice(0, 80), emoji: String(it.emoji || "").slice(0, 8), kcal100: per(it.kcal), p100: per(it.protein_g), c100: per(it.carbs_g), f100: per(it.fat_g), unit_g: null, unit_label: null });
  }
}
const r0 = (x: unknown) => Math.round(Number(x) || 0);
const r1n = (x: unknown) => Math.round((Number(x) || 0) * 10) / 10;
const NU = (d: Data) => { const n = d.nutri || (d.nutri = {}); for (const k of ["log", "weights", "weeks"]) if (!Array.isArray(n[k])) n[k] = []; return n; };
const nowBxl = () => { const p = Object.fromEntries(BXL.formatToParts(new Date()).map((x) => [x.type, x.value])); return `${p.hour}:${p.minute}`; };
// instant ISO d'une heure de Bruxelles (l'app range « at » en ISO)
function atIso(date: string, time: string) {
  const [h, m] = time.split(":").map(Number), guess = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), h, m));
  const p = Object.fromEntries(BXL.formatToParts(guess).map((x) => [x.type, x.value]));
  const off = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - guess.getTime();
  return new Date(guess.getTime() - off).toISOString();
}
const dayTot = (log: Data[]) => log.reduce((a, x) => ({ kcal: a.kcal + (+x.kcal || 0), p: a.p + (+x.p || 0), c: a.c + (+x.c || 0), f: a.f + (+x.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
const fmtTot = (t: Data) => `${r0(t.kcal)} kcal · P ${r0(t.p)} g · G ${r0(t.c)} g · L ${r0(t.f)} g`;
function nutriDay(d: Data, day: string) {
  const n = NU(d), del = d.del || {}, pl = n.plan || {};
  const log = n.log.filter((x: Data) => x && x.day === day && !del[x.id]).sort((a: Data, b: Data) => String(a.at || "").localeCompare(String(b.at || "")));
  const t = dayTot(log), groups = new Map<string, Data[]>();
  for (const x of log) { const g = x.grp || x.id; groups.set(g, [...(groups.get(g) || []), x]); }
  let out = `Journée du ${dayName(day)} ${day}.\n`;
  out += pl.kcal ? `Objectif : ${fmtTot({ kcal: pl.kcal, p: pl.p, c: pl.c, f: pl.f })}.\n` : "Pas encore d'objectif : la personne peut le calculer dans Sid'note (Santé → Nutrition → profil).\n";
  if (n.profile && n.profile.goal) out += `Profil : ${n.profile.sex === "h" ? "homme" : "femme"}, ${n.profile.age} ans, ${n.profile.height} cm, ${n.profile.weight} kg, objectif ${({ gain: "prendre du poids", lose: "perdre du poids", maintain: "garder son poids" } as Data)[n.profile.goal] || n.profile.goal}${n.profile.notes ? `, notes : ${n.profile.notes}` : ""}.\n`;
  out += groups.size ? "Repas notés :\n" + [...groups.values()].map((g) => {
    const tt = dayTot(g), h = g[0].at ? new Intl.DateTimeFormat("fr-BE", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit" }).format(new Date(g[0].at)) : "";
    return `- ${h} ${g[0].gem || g[0].em || ""} ${g[0].gname || g[0].name} (${fmtTot(tt)}) : ${g.map((x) => `${x.name}${x.qty ? ` ${x.qty}` : ""}`).join(", ")} (id ${g[0].grp || g[0].id})`;
  }).join("\n") : "Aucun repas noté.";
  out += `\nTotal : ${fmtTot(t)}.`;
  if (pl.kcal) out += `\nReste : ${fmtTot({ kcal: pl.kcal - t.kcal, p: (pl.p || 0) - t.p, c: (pl.c || 0) - t.c, f: (pl.f || 0) - t.f })}.`;
  return out;
}

// v39 : dossiers de notes (data.noteFolders = [{id, name, parent}]) et petit texte mis en forme (n.html, mêmes balises que l'éditeur de l'app)
const escH = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function mdToHtml(md: string) {
  const out: string[] = []; let list = "";
  const close = () => { if (list) { out.push(list === "chk" ? "</ul>" : `</${list}>`); list = ""; } };
  const inl = (x: string) => escH(x).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  for (const raw of md.split("\n")) {
    const l = raw.trimEnd();
    let m;
    if ((m = l.match(/^\s*\[( |x)\]\s+(.*)$/i))) { if (list !== "chk") { close(); out.push('<ul class="chk">'); list = "chk"; } out.push(`<li data-c="${m[1].trim() ? 1 : 0}">${inl(m[2])}</li>`); continue; }
    if ((m = l.match(/^\s*[-*•]\s+(.*)$/))) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inl(m[1])}</li>`); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inl(m[1])}</li>`); continue; }
    close();
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { out.push(m[1].length === 1 ? `<h2>${inl(m[2])}</h2>` : `<h3>${inl(m[2])}</h3>`); continue; }
    out.push(l ? `<div>${inl(l)}</div>` : "<div><br></div>");
  }
  close();
  return out.join("");
}
function folderPath(d: Data, path: unknown): string | null {
  const parts = String(path || "").split("/").map((x) => x.trim().slice(0, 60)).filter(Boolean).slice(0, 6);
  if (!parts.length) return null;
  d.noteFolders = Array.isArray(d.noteFolders) ? d.noteFolders : [];
  let parent: string | null = null;
  for (const name of parts) {
    let f = d.noteFolders.find((x: Data) => x && (x.parent || null) === parent && norm(x.name) === norm(name));
    if (!f) { f = { id: uid(), name, parent, createdAt: new Date().toISOString() }; d.noteFolders.push(f); }
    parent = f.id;
  }
  return parent;
}
function folderName(d: Data, id: string) {
  const fs = Array.isArray(d.noteFolders) ? d.noteFolders : [], p: string[] = [];
  let f = fs.find((x: Data) => x && x.id === id), g = 0;
  while (f && g++ < 20) { p.unshift(f.name); const par = f.parent; f = fs.find((x: Data) => x && x.id === par); }
  return p.join("/");
}

const typeName = (d: Data, n: unknown) => {
  const v = String(n || "").trim().replace(/\s+/g, " ");
  if (!v) return "";
  d.types = Array.isArray(d.types) ? d.types : [];
  const t = d.types.find((x: Data) => norm(x.name) === norm(v));
  if (t) return t.name;
  const PAL = ["--c-event", "--c-cours", "--c-stage", "--c-memoire", "--c-perso", "--x1", "--x2", "--x3", "--x4", "--x5", "--x6"]; // = PALETTE de l'app
  const used = d.types.map((x: Data) => x.c);
  const nt = { name: v.charAt(0).toUpperCase() + v.slice(1), c: PAL.find((c) => !used.includes(c)) || PAL[d.types.length % PAL.length] };
  d.types.push(nt);
  return nt.name;
};
// v39 : tâches planifiées (todo.day) ; pas faite à temps → affichée le jour suivant (comme dans l'app : tDay)
const tDay = (t: Data) => !t.day ? null : t.done ? t.day : t.day < today() ? today() : t.day;
const tWhen = (t: Data) => { if (!t.day || t.done) return ""; const d = tDay(t); return t.day < today() ? ` (reportée depuis le ${t.day})` : d === today() ? " (aujourd'hui)" : ` (prévue ${dayName(d!)} ${d})`; };
const catName = (d: Data, id: unknown) => (Array.isArray(d.todoCats) ? d.todoCats : []).find((c: Data) => c && c.id === id)?.name || "";
const findOne = (arr: Data[], key: string, label: string) => {
  const k = String(key || "").trim();
  if (!k) throw new Error(`Précise ${label}.`);
  const byId = arr.find((x) => x && x.id === k);
  if (byId) return byId;
  const m = arr.filter((x) => x && norm(x.title).includes(norm(k)));
  if (m.length === 1) return m[0];
  if (!m.length) throw new Error(`Aucun élément ne correspond à « ${k} ».`);
  throw new Error(`Plusieurs éléments correspondent à « ${k} » : ${m.slice(0, 8).map((x) => `${x.title} (id ${x.id})`).join(", ")}. Donne l'id.`);
};

const TOOLS = [
  {
    name: "agenda",
    description: "Liste les activités de l'agenda Sid'note entre deux dates (par défaut : aujourd'hui et les 14 jours suivants). Les dates sont au format AAAA-MM-JJ, heure de Bruxelles. Comprend les cours du calendrier relié (iCal) et donne le jour de la semaine.",
    inputSchema: { type: "object", properties: { from: { type: "string", description: "Date de début AAAA-MM-JJ" }, to: { type: "string", description: "Date de fin AAAA-MM-JJ (incluse)" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "ajouter_activite",
    description: "Ajoute une activité à l'agenda Sid'note (rendez-vous, examen, sortie…).",
    inputSchema: {
      type: "object", required: ["title", "date"],
      properties: {
        title: { type: "string", description: "Titre de l'activité" },
        date: { type: "string", description: "Date AAAA-MM-JJ" },
        time: { type: "string", description: "Heure de début HH:MM (facultatif)" },
        end_time: { type: "string", description: "Heure de fin HH:MM (facultatif)" },
        end_date: { type: "string", description: "Date de fin AAAA-MM-JJ pour une activité sur plusieurs jours (facultatif)" },
        type: { type: "string", description: "Type ou catégorie (ex. Examen, Sport) ; créé s'il n'existe pas (facultatif)" },
        reminders: { type: "array", items: { type: "number" }, description: "Rappels en minutes avant le début, ex. [60] pour 1 h avant, [10, 60]. La veille (1440) est toujours envoyée en plus. Sans heure, l'activité compte à 8 h." },
      },
    },
  },
  {
    name: "modifier_activite",
    description: "Modifie une activité de l'agenda (id ou morceau du titre, voir agenda) : titre, date, heure, rappels. Seuls les champs donnés changent.",
    inputSchema: {
      type: "object", required: ["activity"],
      properties: {
        activity: { type: "string", description: "Id ou morceau du titre" },
        title: { type: "string" }, date: { type: "string", description: "AAAA-MM-JJ" }, time: { type: "string", description: "HH:MM, ou vide pour retirer l'heure" },
        end_time: { type: "string" },
        reminders: { type: "array", items: { type: "number" }, description: "Rappels en minutes avant, ex. [60]. La veille reste toujours active." },
      },
    },
  },
  {
    name: "taches",
    description: "Liste les tâches (à faire) de Sid'note, avec leur catégorie. Par défaut seulement celles qui restent à faire.",
    inputSchema: { type: "object", properties: { include_done: { type: "boolean", description: "Inclure aussi les tâches réalisées (les 30 dernières)" }, category: { type: "string", description: "Seulement cette catégorie" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "ajouter_tache",
    description: "Ajoute une tâche à faire dans Sid'note, éventuellement pour un jour précis (elle apparaît alors dans l'agenda de ce jour et passe au lendemain si elle n'est pas faite) et dans une catégorie (créée si elle n'existe pas).",
    inputSchema: { type: "object", required: ["title"], properties: { title: { type: "string" }, date: { type: "string", description: "Jour prévu AAAA-MM-JJ (facultatif)" }, category: { type: "string", description: "Nom de la catégorie (facultatif)" } } },
  },
  {
    name: "planifier_tache",
    description: "Prévoit une tâche existante pour un jour (AAAA-MM-JJ), ou retire sa date (date vide). Donne son id ou un morceau de son titre.",
    inputSchema: { type: "object", required: ["task"], properties: { task: { type: "string" }, date: { type: "string" } } },
  },
  {
    name: "terminer_tache",
    description: "Marque une tâche comme réalisée. Donne son id (voir « taches ») ou un morceau de son titre.",
    inputSchema: { type: "object", required: ["task"], properties: { task: { type: "string", description: "Id ou morceau du titre" } } },
  },
  {
    name: "notes",
    description: "Liste ou cherche dans les notes Sid'note (titre et début du texte). Les notes secrètes (chiffrées) ne sont jamais accessibles.",
    inputSchema: { type: "object", properties: { search: { type: "string", description: "Mots à chercher (facultatif)" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "lire_note",
    description: "Lit le texte complet d'une note (id ou morceau du titre).",
    inputSchema: { type: "object", required: ["note"], properties: { note: { type: "string" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "ajouter_note",
    description: "Crée une nouvelle note dans Sid'note, éventuellement dans un dossier (chemin « Cours/Finance », créé s'il n'existe pas). Le texte peut contenir des lignes « # Titre », « - puce », « 1. étape » et « [ ] case », et du **gras**.",
    inputSchema: { type: "object", required: ["title", "body"], properties: { title: { type: "string" }, body: { type: "string" }, folder: { type: "string", description: "Dossier, ex. Cours/Finance (facultatif)" } } },
  },
  {
    name: "nutrition_journee",
    description: "Journée Nutrition d'un jour (par défaut aujourd'hui) : objectif du jour (calories, protéines, glucides, lipides), repas déjà notés, total et ce qu'il reste. À lire avant de proposer un repas ou un menu.",
    inputSchema: { type: "object", properties: { date: { type: "string", description: "Date AAAA-MM-JJ (facultatif)" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "noter_repas",
    description: "Note dans Sid'note ce que la personne a mangé (texte, photo d'assiette…). C'est TOI qui estimes les quantités, les calories et les macros de chaque aliment (références USDA/CIQUAL), puis tu appelles cet outil. Un appel = un repas ou un plat.",
    inputSchema: {
      type: "object", required: ["meal_name", "items"],
      properties: {
        meal_name: { type: "string", description: "Nom court du plat ou du repas (ex. Pâtes bolognaise)" },
        emoji: { type: "string", description: "Un emoji pour le plat" },
        date: { type: "string", description: "AAAA-MM-JJ (par défaut aujourd'hui)" },
        time: { type: "string", description: "HH:MM (par défaut maintenant)" },
        items: {
          type: "array",
          items: {
            type: "object", required: ["name", "kcal", "protein_g", "carbs_g", "fat_g"],
            properties: { name: { type: "string" }, emoji: { type: "string" }, quantity: { type: "string", description: "ex. 150 g, 2 œufs" }, grams: { type: "number", description: "Poids estimé en grammes" }, kcal: { type: "number" }, protein_g: { type: "number" }, carbs_g: { type: "number" }, fat_g: { type: "number" } },
          },
        },
      },
    },
  },
  {
    name: "retirer_repas",
    description: "Retire un repas noté par erreur (nom du plat ou id, voir nutrition_journee), pour le jour donné.",
    inputSchema: { type: "object", required: ["meal"], properties: { meal: { type: "string" }, date: { type: "string" } } },
  },
  {
    name: "enregistrer_menu",
    description: "Enregistre dans Sid'note un menu que TU as composé (journée ou un seul repas), visible dans l'onglet Nutrition. Respecte l'objectif lu avec nutrition_journee. Poids crus, en grammes.",
    inputSchema: {
      type: "object", required: ["meals"],
      properties: {
        tips: { type: "string" },
        meals: {
          type: "array",
          items: {
            type: "object", required: ["slot", "name", "items"],
            properties: {
              slot: { type: "string", enum: ["breakfast", "lunch", "snack", "dinner", "meal"], description: "meal = repas unique de la journée" },
              name: { type: "string" }, emoji: { type: "string" },
              steps: { type: "array", items: { type: "string" }, description: "Recette en étapes courtes (facultatif)" },
              items: { type: "array", items: { type: "object", required: ["name", "grams", "kcal", "protein_g", "carbs_g", "fat_g"],
                properties: { name: { type: "string" }, emoji: { type: "string" }, grams: { type: "number" }, kcal: { type: "number" }, protein_g: { type: "number" }, carbs_g: { type: "number" }, fat_g: { type: "number" } } } },
            },
          },
        },
      },
    },
  },
  {
    name: "nutrition_semaine",
    description: "Les 7 derniers jours (ou depuis une date) : calories et macros par jour comparés à l'objectif, et le poids. Sert à faire un bilan.",
    inputSchema: { type: "object", properties: { to: { type: "string", description: "Dernier jour AAAA-MM-JJ (par défaut aujourd'hui)" } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: "noter_poids",
    description: "Note le poids de la personne (kg) pour un jour (par défaut aujourd'hui). Il apparaît dans les graphiques.",
    inputSchema: { type: "object", required: ["kg"], properties: { kg: { type: "number" }, date: { type: "string" } } },
  },
  {
    name: "enregistrer_commentaire",
    description: "Enregistre dans Sid'note le commentaire nutrition que TU as écrit (du jour ou de la semaine), pour qu'il s'affiche dans l'app (Graphiques). À appeler après avoir fait un bilan avec nutrition_journee ou nutrition_semaine.",
    inputSchema: {
      type: "object", required: ["scope", "summary"],
      properties: {
        scope: { type: "string", enum: ["day", "week"], description: "day = commentaire du jour, week = de la semaine" },
        summary: { type: "string", description: "Résumé en 2 ou 3 phrases" },
        good: { type: "array", items: { type: "string" }, description: "Ce qui va bien" },
        improve: { type: "array", items: { type: "string" }, description: "Ce qui peut s'améliorer" },
        tips: { type: "array", items: { type: "string" }, description: "Conseils concrets" },
      },
    },
  },
  {
    name: "muscu_programme",
    description: "Programme de musculation de la personne (profil : niveau, objectif, jours, durée, matériel, zones à ménager, muscles prioritaires ; séances et exercices) et ses dernières séances faites (charges et répétitions). À lire avant de proposer ou d'ajuster un programme.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "enregistrer_programme",
    description: "Enregistre un programme de musculation que TU as composé ou ajusté (remplace l'actuel). Visible dans Sid'note (Santé → Musculation), avec mode séance et progression des charges. Adapte-le au profil lu avec muscu_programme (exercices imposés et exclus compris). Dans une séance, chaque exercice doit apporter quelque chose de différent : jamais deux exercices du même schéma de mouvement pour le même muscle (ex. pecs : un développé horizontal, un incliné, un écarté). Repos : 3 min pour les gros exercices polyarticulaires (jusqu'à 4 min pour les plus lourds), au moins 2 min pour l'isolation. Respecte les remarques de la personne lues avec muscu_programme (ex. abdos tous les jours, pas deux séances jambes) ; pour un ajustement, garde ce qui va bien et ne change que ce qui est demandé.",
    inputSchema: {
      type: "object", required: ["days"],
      properties: {
        goal: { type: "string", enum: ["muscle", "force", "gras", "forme"], description: "Objectif (facultatif : sinon celui du profil)" },
        days: {
          type: "array", description: "Une entrée par séance de la semaine (2 à 6)",
          items: {
            type: "object", required: ["name", "exercises"],
            properties: {
              name: { type: "string", description: "ex. Séance A · Haut du corps" },
              exercises: { type: "array", items: { type: "object", required: ["name", "sets", "reps"],
                properties: { name: { type: "string" }, sets: { type: "number" }, reps: { type: "string", description: "ex. 8–10" }, rest_s: { type: "number", description: "Repos en secondes" }, rir: { type: "string", description: "Répétitions en réserve, ex. 1–2" }, note: { type: "string" } } } },
            },
          },
        },
      },
    },
  },
  {
    name: "noter_seance",
    description: "Note une séance de musculation faite (exercices, séries avec kg et répétitions). Elle sert à la progression des charges dans Sid'note.",
    inputSchema: {
      type: "object", required: ["exercises"],
      properties: {
        name: { type: "string", description: "Nom de la séance" }, date: { type: "string", description: "AAAA-MM-JJ (par défaut aujourd'hui)" }, minutes: { type: "number" },
        exercises: { type: "array", items: { type: "object", required: ["name", "sets"], properties: { name: { type: "string" }, sets: { type: "array", items: { type: "object", properties: { kg: { type: "number" }, reps: { type: "number" } } } } } } },
      },
    },
  },
];
// rappels d'une activité (comme remApply dans l'app) : t.leads = délais choisis, la veille toujours comprise
const leadsOf = (v: unknown) => {
  const a = (Array.isArray(v) ? v : [v]).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 10080).map(Math.round);
  return a.length ? [...new Set([...a, 1440])].sort((x, y) => x - y).slice(0, 6) : null;
};
const leadTxt = (m: number) => m === 1440 ? "la veille" : m % 1440 === 0 ? `${m / 1440} jours avant` : m >= 60 ? `${Math.round(m / 6) / 10} h avant`.replace(".", ",") : `${m} min avant`;
const MU = (d: Data) => { const m = d.muscu || (d.muscu = { sessions: [] }); if (!Array.isArray(m.log)) m.log = []; return m; };

// deno-lint-ignore no-explicit-any
async function callTool(user: string, name: string, a: any, nameOf: string): Promise<string> {
  a = a || {};
  switch (name) {
    case "agenda": {
      const from = isDate(a.from) ? a.from : today(), to = isDate(a.to) ? a.to : addDays(from, 14);
      const { data } = await readData(user);
      const del = data.del || {};
      let cal = await icalEvents(data, from, to);
      let calNote = "";
      if (cal === null) { // calendrier injoignable : on reprend la copie des 14 prochains jours faite par l'app
        cal = (Array.isArray(data.icalSoon) ? data.icalSoon : []).filter((c: Data) => c && c.date >= from && c.date <= to).map((c: Data) => ({ ...c, src: "ical" }));
        calNote = "\n(Calendrier relié injoignable pour l'instant : cours repris de la dernière copie faite par l'app.)";
      }
      const list = (Array.isArray(data.tasks) ? data.tasks : [])
        .filter((t: Data) => t && !del[t.id] && t.src !== "ical" && t.date && (t.end || t.date) >= from && t.date <= to)
        .concat(cal.filter((c: Data) => !c.canc))
        .sort((x: Data, y: Data) => (x.date + (x.time || "")).localeCompare(y.date + (y.time || "")));
      const head = `Aujourd'hui : ${dayName(today())} ${today()}.`;
      const todos = (Array.isArray(data.todos) ? data.todos : []).filter((t: Data) => t && !del[t.id] && !t.paused && !t.done && t.day && tDay(t)! >= from && tDay(t)! <= to)
        .map((t: Data) => `- ${dayName(tDay(t)!)} ${tDay(t)} · tâche : ${t.title}${t.day < today() ? " (reportée)" : ""} (id ${t.id})`);
      const todoTxt = todos.length ? `\nTâches prévues :\n${todos.join("\n")}` : "";
      if (!list.length) return `${head}\nAucune activité ni aucun cours entre le ${from} et le ${to}.${todoTxt}${calNote}`;
      return `${head}\n` + list.map((t: Data) =>
        `- ${dayName(t.date)} ${t.date}${t.end ? ` → ${t.end}` : ""}${t.time ? ` ${t.time}${t.timeEnd ? `–${t.timeEnd}` : ""}` : ""} · ${t.title}` +
        (t.src === "ical" ? ` [cours, calendrier relié${t.loc ? `, ${t.loc}` : ""}]` : `${t.cat ? ` [${t.cat}]` : ""}${t.status && t.status !== "à faire" ? ` (${t.status})` : ""} (id ${t.id})`)).join("\n") + todoTxt + calNote;
    }
    case "ajouter_activite": {
      const title = String(a.title || "").trim();
      if (!title || !isDate(a.date)) throw new Error("Il faut un titre et une date AAAA-MM-JJ.");
      if (a.time && !isTime(a.time)) throw new Error("Heure au format HH:MM.");
      const t: Data = await writeData(user, (d) => {
        d.tasks = Array.isArray(d.tasks) ? d.tasks : [];
        const t: Data = { id: uid(), title, date: a.date, status: "à faire", tbc: false, cat: typeName(d, a.type) };
        if (isTime(a.time)) t.time = a.time;
        if (t.time && isTime(a.end_time) && a.end_time > t.time) t.timeEnd = a.end_time;
        if (isDate(a.end_date) && a.end_date > a.date) t.end = a.end_date;
        const l = leadsOf(a.reminders);
        if (l) t.leads = l;
        d.tasks.push(t);
        return t;
      });
      return `Ajouté à l'agenda : ${t.title}, le ${t.date}${t.time ? ` à ${t.time}` : ""} (id ${t.id}).` + (t.leads ? ` Rappels : ${t.leads.map(leadTxt).join(", ")}.` : " Rappel : la veille (et les délais choisis dans Sid'note).");
    }
    case "modifier_activite": {
      if (a.date !== undefined && !isDate(a.date)) throw new Error("Date au format AAAA-MM-JJ.");
      if (a.time && !isTime(a.time)) throw new Error("Heure au format HH:MM.");
      const t: Data = await writeData(user, (d) => {
        const del = d.del || {};
        const t = findOne((Array.isArray(d.tasks) ? d.tasks : []).filter((x: Data) => x && !del[x.id] && x.src !== "ical"), a.activity, "l'activité");
        if (String(a.title || "").trim()) t.title = String(a.title).trim();
        if (isDate(a.date)) t.date = a.date;
        if (a.time !== undefined) { if (isTime(a.time)) t.time = a.time; else { delete t.time; delete t.timeEnd; } }
        if (t.time && isTime(a.end_time) && a.end_time > t.time) t.timeEnd = a.end_time;
        const l = leadsOf(a.reminders);
        if (l) { t.leads = l; delete t.remind; }
        t.upd = Date.now();
        return t;
      });
      return `Activité modifiée : ${t.title}, le ${dayName(t.date)} ${t.date}${t.time ? ` à ${t.time}` : ""}.` + (t.leads ? ` Rappels : ${t.leads.map(leadTxt).join(", ")}.` : "");
    }
    case "taches": {
      const { data } = await readData(user);
      const del = data.del || {};
      let list = (Array.isArray(data.todos) ? data.todos : []).filter((t: Data) => t && !del[t.id]);
      if (a.category) list = list.filter((t: Data) => norm(catName(data, t.cat)) === norm(a.category));
      const open = list.filter((t: Data) => !t.done);
      const fmt = (t: Data) => `- ${t.title}${t.cat ? ` [${catName(data, t.cat)}]` : ""}${tWhen(t)}${t.paused ? " (en suspens)" : ""} (id ${t.id})`;
      let out = open.length ? `À faire (${open.length}) :\n` + open.map(fmt).join("\n") : "Rien à faire pour l'instant.";
      if (a.include_done) {
        const done = list.filter((t: Data) => t.done).sort((x: Data, y: Data) => String(y.doneAt || "").localeCompare(String(x.doneAt || ""))).slice(0, 30);
        out += `\n\nRéalisées récemment :\n` + (done.map((t: Data) => `- ${t.title} (${String(t.doneAt || "").slice(0, 10)})`).join("\n") || "aucune");
      }
      return out;
    }
    case "ajouter_tache": {
      const title = String(a.title || "").trim();
      if (!title) throw new Error("Il faut un titre.");
      const t: Data = await writeData(user, (d) => {
        d.todos = Array.isArray(d.todos) ? d.todos : [];
        const t: Data = { id: uid(), title, createdAt: new Date().toISOString(), done: false };
        if (isDate(a.date)) t.day = a.date;
        const c = String(a.category || "").trim().replace(/\s+/g, " ");
        if (c) {
          d.todoCats = Array.isArray(d.todoCats) ? d.todoCats : [];
          let cat = d.todoCats.find((x: Data) => x && norm(x.name) === norm(c));
          if (!cat) { cat = { id: uid(), name: c }; d.todoCats.push(cat); }
          t.cat = cat.id;
        }
        d.todos.push(t);
        return t;
      });
      return `Tâche ajoutée : ${t.title}${t.day ? `, prévue le ${dayName(t.day)} ${t.day}` : ""} (id ${t.id}).`;
    }
    case "planifier_tache": {
      const t: Data = await writeData(user, (d) => {
        const del = d.del || {};
        const t = findOne((Array.isArray(d.todos) ? d.todos : []).filter((x: Data) => x && !del[x.id] && !x.done), a.task, "la tâche");
        if (isDate(a.date)) t.day = a.date; else delete t.day;
        t.upd = Date.now();
        return t;
      });
      return t.day ? `« ${t.title} » est prévue le ${dayName(t.day)} ${t.day}.` : `« ${t.title} » n'a plus de date.`;
    }
    case "terminer_tache": {
      const t: Data = await writeData(user, (d) => {
        const del = d.del || {};
        const open = (Array.isArray(d.todos) ? d.todos : []).filter((x: Data) => x && !del[x.id] && !x.done);
        const t = findOne(open, a.task, "la tâche");
        t.done = true;
        t.doneAt = new Date().toISOString();
        if (t.day && t.day < today()) t.day = today();
        return t;
      });
      return `C'est noté : « ${t.title} » est réalisée.`;
    }
    case "notes": {
      const { data } = await readData(user);
      const del = data.del || {};
      let list = (Array.isArray(data.notes) ? data.notes : []).filter((n: Data) => n && !n.secret && !del[n.id] && (n.title || n.body));
      if (a.search) {
        const words = norm(a.search).split(/\s+/).filter(Boolean);
        list = list.filter((n: Data) => { const h = norm(n.title + " " + n.body); return words.some((w) => h.includes(w)); });
      }
      list.sort((x: Data, y: Data) => (y.upd || 0) - (x.upd || 0));
      if (!list.length) return a.search ? `Aucune note ne parle de « ${a.search} ».` : "Aucune note.";
      return list.slice(0, 40).map((n: Data) => `- ${n.title || "(sans titre)"}${n.folder ? ` [dossier ${folderName(data, n.folder)}]` : ""} — ${String(n.body || "").replace(/\s+/g, " ").slice(0, 120)} (id ${n.id})`).join("\n");
    }
    case "lire_note": {
      const { data } = await readData(user);
      const del = data.del || {};
      const n = findOne((Array.isArray(data.notes) ? data.notes : []).filter((x: Data) => x && !x.secret && !del[x.id]), a.note, "la note");
      return `# ${n.title || "(sans titre)"}\n\n${n.body || ""}`;
    }
    case "ajouter_note": {
      const n: Data = await writeData(user, (d) => {
        d.notes = Array.isArray(d.notes) ? d.notes : [];
        const body = String(a.body || "");
        const n: Data = { id: uid(), title: String(a.title || "").trim(), body: body.replace(/^#+\s*|^\s*\[[ x]\]\s*/gim, "").replace(/\*\*/g, ""), html: mdToHtml(body), createdAt: new Date().toISOString(), upd: Date.now() };
        const fid = folderPath(d, a.folder);
        if (fid) n.folder = fid;
        d.notes.push(n);
        return n;
      });
      return `Note créée : ${n.title || "(sans titre)"} (id ${n.id}).`;
    }
    case "nutrition_journee": {
      const { data } = await readData(user);
      return nutriDay(data, isDate(a.date) ? a.date : today());
    }
    case "noter_repas": {
      const items = (Array.isArray(a.items) ? a.items : []).filter((x: Data) => x && String(x.name || "").trim()).slice(0, 30);
      if (!items.length) throw new Error("Il faut au moins un aliment.");
      const day = isDate(a.date) ? a.date : today(), at = atIso(day, isTime(a.time) ? a.time : nowBxl());
      const name = String(a.meal_name || items[0].name).trim().slice(0, 80), em = String(a.emoji || "🍽️").slice(0, 8);
      const out: Data = await writeData(user, (d) => {
        const n = NU(d), grp = uid(), now = Date.now();
        for (const x of items) n.log.push({ id: uid(), day, at, grp, gname: name, gem: em, name: String(x.name).trim().slice(0, 80), qty: String(x.quantity || "").slice(0, 40), em: String(x.emoji || "").slice(0, 8),
          kcal: r0(x.kcal), p: r1n(x.protein_g), c: r1n(x.carbs_g), f: r1n(x.fat_g), upd: now, src: "ia" });
        return { txt: nutriDay(d, day), lang: d.prefs && ["en", "nl"].includes(d.prefs.lang) ? d.prefs.lang : "fr" };
      });
      await learnFoods(items, out.lang).catch(() => {});
      return `Repas noté dans Sid'note : ${name}.\n\n${out.txt}`;
    }
    case "retirer_repas": {
      const day = isDate(a.date) ? a.date : today(), k = String(a.meal || "").trim();
      const out: Data = await writeData(user, (d) => {
        const n = NU(d), del = d.del || (d.del = {});
        const log = n.log.filter((x: Data) => x && x.day === day && !del[x.id]);
        const g = log.find((x: Data) => (x.grp || x.id) === k) || (() => {
          const m = [...new Set(log.filter((x: Data) => norm(x.gname || x.name).includes(norm(k))).map((x: Data) => x.grp || x.id))];
          if (m.length === 1) return log.find((x: Data) => (x.grp || x.id) === m[0]);
          throw new Error(m.length ? "Plusieurs repas correspondent : donne l'id (voir nutrition_journee)." : `Aucun repas « ${k} » le ${day}.`);
        })();
        const gid = g.grp || g.id, now = Date.now();
        for (const x of n.log) if ((x.grp || x.id) === gid) del[x.id] = now; // pierres tombales, comme tomb() dans l'app
        n.log = n.log.filter((x: Data) => (x.grp || x.id) !== gid);
        return nutriDay(d, day);
      });
      return `Repas retiré.\n\n${out}`;
    }
    case "enregistrer_menu": {
      const SL = ["breakfast", "lunch", "snack", "dinner", "meal"];
      const meals = (Array.isArray(a.meals) ? a.meals : []).filter((m: Data) => m && Array.isArray(m.items) && m.items.length).slice(0, 6).map((m: Data) => ({
        slot: SL.includes(m.slot) ? m.slot : "lunch", name: String(m.name || "").slice(0, 80), em: String(m.emoji || "🍽️").slice(0, 8),
        steps: Array.isArray(m.steps) ? m.steps.map((x: unknown) => String(x).slice(0, 300)).slice(0, 12) : null,
        items: m.items.slice(0, 20).map((x: Data) => ({ name: String(x.name || "").slice(0, 80), em: String(x.emoji || "").slice(0, 8), g: r0(x.grams), qty: r0(x.grams) + " g", kcal: r0(x.kcal), p: r1n(x.protein_g), c: r1n(x.carbs_g), f: r1n(x.fat_g) })),
      }));
      if (!meals.length) throw new Error("Le menu est vide.");
      await writeData(user, (d) => {
        const n = NU(d), at = new Date().toISOString();
        if (meals.length > 1 || !n.menu || !Array.isArray(n.menu.meals)) n.menu = { meals, tips: String(a.tips || ""), at };
        else { const i = n.menu.meals.findIndex((m: Data) => m.slot === meals[0].slot); if (i >= 0) n.menu.meals[i] = meals[0]; else n.menu.meals.push(meals[0]); n.menu.at = at; }
        n.upd = Date.now();
      });
      const t = dayTot(meals.flatMap((m: Data) => m.items));
      return `Menu enregistré dans Sid'note (onglet Nutrition) : ${meals.map((m: Data) => m.name).join(", ")}. Total : ${fmtTot(t)}.`;
    }
    case "nutrition_semaine": {
      const { data } = await readData(user);
      const n = NU(data), del = data.del || {}, pl = n.plan || {}, to = isDate(a.to) ? a.to : today();
      const lines = [];
      for (let i = 6; i >= 0; i--) {
        const day = addDays(to, -i), log = n.log.filter((x: Data) => x && x.day === day && !del[x.id]);
        lines.push(`- ${dayName(day)} ${day} : ${log.length ? fmtTot(dayTot(log)) : "rien de noté"}`);
      }
      const w = n.weights.filter((x: Data) => x && x.day >= addDays(to, -30) && x.day <= to && !del[x.id]).sort((x: Data, y: Data) => x.day.localeCompare(y.day));
      return `Objectif par jour : ${pl.kcal ? fmtTot({ kcal: pl.kcal, p: pl.p, c: pl.c, f: pl.f }) : "pas encore calculé"}.\n${lines.join("\n")}\nPoids (30 derniers jours) : ${w.length ? w.map((x: Data) => `${x.day} ${x.kg} kg`).join(", ") : "aucun"}.`;
    }
    case "noter_poids": {
      const kg = r1n(a.kg), day = isDate(a.date) ? a.date : today();
      if (!(kg >= 25 && kg <= 300)) throw new Error("Poids invalide (kg).");
      await writeData(user, (d) => {
        const n = NU(d), w = n.weights.find((x: Data) => x && x.day === day);
        if (w) { w.kg = kg; w.upd = Date.now(); } else n.weights.push({ id: uid(), day, kg, upd: Date.now() });
      });
      return `Poids noté : ${kg} kg le ${day}.`;
    }
    case "enregistrer_commentaire": {
      const scope = a.scope === "week" ? "week" : "day", summary = String(a.summary || "").trim().slice(0, 1500);
      if (!summary) throw new Error("Le commentaire est vide.");
      const list = (v: unknown) => (Array.isArray(v) ? v : []).map((x) => String(x).trim().slice(0, 300)).filter(Boolean).slice(0, 6);
      // même format que l'app (data.nutri.rev, et data.nutri.weeks pour garder chaque semaine) ; clé = jour ou lundi de la semaine
      const monday = () => { const d = new Date(today() + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
      const rec = { key: scope === "day" ? today() : monday(), summary, good: list(a.good), improve: list(a.improve), tips: list(a.tips), at: new Date().toISOString() };
      await writeData(user, (d) => {
        const n = NU(d);
        n.rev = n.rev || {};
        n.rev[scope] = rec;
        if (scope === "week") { const w = n.weeks.find((x: Data) => x && x.id === rec.key); if (w) Object.assign(w, rec, { upd: Date.now() }); else n.weeks.push({ id: rec.key, ...rec, upd: Date.now() }); }
        n.upd = Date.now();
      });
      return `Commentaire ${scope === "day" ? "du jour" : "de la semaine"} enregistré : il s'affiche dans Sid'note (Graphiques).`;
    }
    case "muscu_programme": {
      const { data } = await readData(user);
      const m = MU(data), p = m.plan && !m.plan.deleted && Array.isArray(m.plan.days) ? m.plan : null, del = data.del || {};
      const G: Data = { muscle: "prendre du muscle", force: "gagner en force", gras: "perdre du gras", forme: "être en forme" }, LV: Data = { deb: "débutant", inter: "intermédiaire", conf: "confirmé" };
      const AV: Data = { shoulder: "épaules", back: "bas du dos", knee: "genoux" }, EQ: Data = { gym: "salle de sport", db: "haltères à la maison", bw: "poids du corps" };
      let out = "";
      if (!p) out = "Pas encore de programme. La personne peut en créer un dans Sid'note (Santé → Musculation → Créer mon programme), ou tu peux en composer un avec enregistrer_programme (demande d'abord niveau, objectif, jours par semaine, durée, matériel, douleurs).\n";
      else {
        const pr = p.profile || {};
        out += `Profil : ${LV[pr.level] || pr.level || "?"}, objectif ${G[pr.goal] || pr.goal || "?"}, ${pr.days || p.days.length} séances/semaine de ${pr.dur || "?"} min, ${EQ[pr.equip] || pr.equip || "?"}${(pr.avoid || []).length ? `, à ménager : ${pr.avoid.map((x: string) => AV[x] || x).join(", ")}` : ""}${(pr.prio || []).length ? `, priorités : ${pr.prio.join(", ")}` : ""}${(pr.must || []).length ? `, exercices imposés : ${pr.must.join(", ")}` : ""}${(pr.never || []).length ? `, exercices exclus (ne jamais proposer) : ${pr.never.join(", ")}` : ""}.\n`;
        // v7 (Sid'home v43) : zone libre à ménager, remarques de la personne (à respecter en priorité)
        if (pr.avoidTxt) out += `Autre chose à ménager (écrit par la personne) : ${String(pr.avoidTxt).slice(0, 200)}.\n`;
        const rem = (Array.isArray(pr.remarks) ? pr.remarks : []).slice(-5);
        if (rem.length) out += `Remarques de la personne sur son programme (à respecter, la plus récente compte le plus) :\n` + rem.map((r: Data) => `- ${String(r.at || "").slice(0, 10)} : ${String(r.text || "").slice(0, 600)}`).join("\n") + "\n";
        else if (pr.notes) out += `Remarques de la personne : ${String(pr.notes).slice(0, 600)}\n`;
        out += `Programme${p.src === "ia" ? " (ajusté par une IA)" : ""} :\n` + p.days.map((d: Data) => `## ${d.name}\n` + d.ex.map((e: Data) => `- ${e.name} : ${e.sets} × ${e.reps}, repos ${e.rest} s${e.rir ? `, RIR ${e.rir}` : ""}${e.note ? ` (${e.note})` : ""}`).join("\n")).join("\n") + "\n";
      }
      const logs = m.log.filter((l: Data) => l && !del[l.id]).sort((x: Data, y: Data) => String(y.date || "").localeCompare(String(x.date || ""))).slice(0, 10);
      out += logs.length ? "Dernières séances :\n" + logs.map((l: Data) => `- ${l.date} ${l.name || ""}${l.min ? ` (${l.min} min)` : ""} : ` + (l.ex || []).map((e: Data) => `${e.name} ${(e.sets || []).map((s: Data) => `${s.reps || "?"}${s.kg ? `×${s.kg}kg` : ""}`).join(", ")}`).join(" ; ")).join("\n") : "Aucune séance notée.";
      return out;
    }
    case "enregistrer_programme": {
      const days = (Array.isArray(a.days) ? a.days : []).filter((d: Data) => d && Array.isArray(d.exercises) && d.exercises.length).slice(0, 7).map((d: Data, i: number) => ({
        id: uid(), name: String(d.name || `Séance ${"ABCDEFG"[i]}`).slice(0, 80),
        ex: d.exercises.slice(0, 12).filter((e: Data) => e && String(e.name || "").trim()).map((e: Data) => ({
          name: String(e.name).trim().slice(0, 80), pat: "", sets: Math.min(10, Math.max(1, r0(e.sets) || 3)), reps: String(e.reps || "8–12").slice(0, 12),
          rest: Math.min(600, Math.max(15, r0(e.rest_s) || 180)), rir: String(e.rir || "").slice(0, 8), note: String(e.note || "").slice(0, 160) })),
      }));
      if (!days.length) throw new Error("Le programme est vide.");
      await writeData(user, (d) => {
        const m = MU(d), old = m.plan && !m.plan.deleted ? m.plan.profile || {} : {};
        const profile = { ...old, days: days.length };
        if (["muscle", "force", "gras", "forme"].includes(a.goal)) profile.goal = a.goal;
        m.plan = { id: uid(), profile, days, at: new Date().toISOString(), upd: Date.now(), src: "ia" };
        m.upd = Date.now();
      });
      return `Programme enregistré dans Sid'note (Santé → Musculation) : ${days.map((d: Data) => d.name).join(", ")}.`;
    }
    case "noter_seance": {
      const ex = (Array.isArray(a.exercises) ? a.exercises : []).filter((e: Data) => e && String(e.name || "").trim()).slice(0, 20).map((e: Data) => ({
        name: String(e.name).trim().slice(0, 80), sets: (Array.isArray(e.sets) ? e.sets : []).slice(0, 12).map((s: Data) => ({ kg: s && s.kg ? String(r1n(s.kg)) : "", reps: s && s.reps ? String(r0(s.reps)) : "" })) }));
      if (!ex.length) throw new Error("Il faut au moins un exercice.");
      const date = isDate(a.date) ? a.date : today();
      await writeData(user, (d) => {
        const m = MU(d), p = m.plan && !m.plan.deleted && Array.isArray(m.plan.days) ? m.plan : null;
        const day = p && p.days.find((x: Data) => norm(x.name) === norm(a.name));
        m.log.push({ id: uid(), date, day: day ? day.id : "", name: String(a.name || "Séance").slice(0, 80), min: r0(a.minutes) || undefined, ex, upd: Date.now() });
        m.upd = Date.now();
      });
      return `Séance notée le ${date} : ${ex.map((e: Data) => e.name).join(", ")}.`;
    }
  }
  throw new Error("Outil inconnu : " + name);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = new URL(req.url).pathname.split("/").filter(Boolean).pop() || "";
  if (key.length < 32) return json({ error: "Adresse incomplète : copie l'adresse complète depuis Sid'note (Réglages > Mon IA)." }, 404);
  const { data: tok } = await db.from("mcp_tokens").select("user_id, label").eq("hash", await sha256(key)).maybeSingle();
  if (!tok) return json({ error: "Clé inconnue ou retirée. Crée une nouvelle adresse dans Sid'note (Réglages > Mon IA)." }, 401);
  if (req.method === "GET" || req.method === "DELETE") return new Response(null, { status: 405, headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non permise" }, 405);

  // deno-lint-ignore no-explicit-any
  let msg: any;
  try { msg = await req.json(); } catch { return rpcErr(null, -32700, "JSON invalide"); }
  if (Array.isArray(msg)) return rpcErr(null, -32600, "Lots non pris en charge");
  const { id, method, params } = msg || {};
  if (id === undefined || id === null) return new Response(null, { status: 202, headers: cors }); // notification

  db.from("mcp_tokens").update({ last_used: new Date().toISOString() }).eq("hash", await sha256(key)).then(() => {});
  switch (method) {
    case "initialize":
      return rpcOk(id, {
        protocolVersion: params?.protocolVersion || "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "sidnote", title: "Sid'note", version: "1.1.0" },
        instructions: "Sid'note est l'application d'organisation de la personne (agenda, cours, tâches, notes, nutrition, musculation). Dates en AAAA-MM-JJ, heure de Bruxelles. Quand la personne demande un rappel pour une activité (ex. 1 h avant), passe-le dans reminders (en minutes) avec ajouter_activite ou modifier_activite : c'est une notification sur son téléphone. Quand la personne dit ce qu'elle a mangé ou envoie la photo de son assiette, estime toi-même calories et macros puis note-le avec noter_repas (sans redemander, sauf doute sur la quantité). Pour un menu, lis d'abord nutrition_journee puis enregistre-le avec enregistrer_menu. Après un bilan ou un commentaire nutrition (jour ou semaine), enregistre-le avec enregistrer_commentaire pour qu'il s'affiche dans l'app. Quand la personne parle d'une chose à faire un jour précis, ajoute la tâche avec sa date (ajouter_tache) : elle apparaîtra ce jour-là dans son agenda et passera au lendemain si elle n'est pas faite. Pour une note, propose un dossier (folder) si c'est utile. Pour la musculation, lis muscu_programme avant d'ajuster, puis enregistre avec enregistrer_programme ; une séance racontée se note avec noter_seance. Les mots de passe, documents et notes secrètes sont chiffrés et jamais accessibles.",
      });
    case "ping":
      return rpcOk(id, {});
    case "tools/list":
      return rpcOk(id, { tools: TOOLS });
    case "tools/call": {
      try {
        const text = await callTool(tok.user_id, params?.name, params?.arguments, tok.label || "Claude");
        return rpcOk(id, { content: [{ type: "text", text }] });
      } catch (e) {
        return rpcOk(id, { content: [{ type: "text", text: (e as Error).message || String(e) }], isError: true });
      }
    }
    case "resources/list":
      return rpcOk(id, { resources: [] });
    case "prompts/list":
      return rpcOk(id, { prompts: [] });
  }
  return rpcErr(id, -32601, "Méthode inconnue : " + method);
});
