// Sid'note v38 : fonction "mcp" : connecteur Sid'note pour Claude (protocole MCP, transport « Streamable HTTP », réponses JSON).
// Adresse : https://<projet>.supabase.co/functions/v1/mcp/<clé>  — la clé est personnelle (créée dans Réglages > Claude),
// seule son empreinte SHA-256 est gardée (table mcp_tokens, supabase/sql/mcp.sql). Verify JWT : OFF.
// Accès : agenda, tâches, notes (pas les notes secrètes), listes partagées. Jamais les coffres (mots de passe, documents).
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
const norm = (s: unknown) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
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
    description: "Liste les activités de l'agenda Sid'note entre deux dates (par défaut : aujourd'hui et les 14 jours suivants). Les dates sont au format AAAA-MM-JJ, heure de Bruxelles. Les cours d'un calendrier relié (iCal) n'y figurent pas.",
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
    description: "Ajoute une tâche à faire dans Sid'note, éventuellement dans une catégorie (créée si elle n'existe pas).",
    inputSchema: { type: "object", required: ["title"], properties: { title: { type: "string" }, category: { type: "string", description: "Nom de la catégorie (facultatif)" } } },
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
    description: "Crée une nouvelle note dans Sid'note.",
    inputSchema: { type: "object", required: ["title", "body"], properties: { title: { type: "string" }, body: { type: "string" } } },
  },
  {
    name: "listes_partagees",
    description: "Montre les listes partagées (courses, choses à faire ensemble) dont la personne est membre, avec leurs éléments.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "ajouter_a_une_liste",
    description: "Ajoute un ou plusieurs éléments à une liste partagée (nom de la liste ou son id).",
    inputSchema: { type: "object", required: ["list", "items"], properties: { list: { type: "string" }, items: { type: "array", items: { type: "string" } } } },
  },
];

async function myLists(user: string) {
  const { data: mem, error } = await db.from("shared_members").select("list_id").eq("user_id", user);
  if (error) throw error;
  const ids = (mem || []).map((m) => m.list_id);
  if (!ids.length) return [];
  const { data: lists } = await db.from("shared_lists").select("id, name").in("id", ids);
  return lists || [];
}

// deno-lint-ignore no-explicit-any
async function callTool(user: string, name: string, a: any, nameOf: string): Promise<string> {
  a = a || {};
  switch (name) {
    case "agenda": {
      const from = isDate(a.from) ? a.from : today(), to = isDate(a.to) ? a.to : addDays(from, 14);
      const { data } = await readData(user);
      const del = data.del || {};
      const list = (Array.isArray(data.tasks) ? data.tasks : [])
        .filter((t: Data) => t && !del[t.id] && t.src !== "ical" && t.date && (t.end || t.date) >= from && t.date <= to)
        .sort((x: Data, y: Data) => (x.date + (x.time || "")).localeCompare(y.date + (y.time || "")));
      if (!list.length) return `Aucune activité entre le ${from} et le ${to}.`;
      return `Aujourd'hui : ${today()}.\n` + list.map((t: Data) =>
        `- ${t.date}${t.end ? ` → ${t.end}` : ""}${t.time ? ` ${t.time}${t.timeEnd ? `–${t.timeEnd}` : ""}` : ""} · ${t.title}${t.cat ? ` [${t.cat}]` : ""}${t.status && t.status !== "à faire" ? ` (${t.status})` : ""} (id ${t.id})`).join("\n");
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
        d.tasks.push(t);
        return t;
      });
      return `Ajouté à l'agenda : ${t.title}, le ${t.date}${t.time ? ` à ${t.time}` : ""} (id ${t.id}).`;
    }
    case "taches": {
      const { data } = await readData(user);
      const del = data.del || {};
      let list = (Array.isArray(data.todos) ? data.todos : []).filter((t: Data) => t && !del[t.id]);
      if (a.category) list = list.filter((t: Data) => norm(catName(data, t.cat)) === norm(a.category));
      const open = list.filter((t: Data) => !t.done);
      const fmt = (t: Data) => `- ${t.title}${t.cat ? ` [${catName(data, t.cat)}]` : ""}${t.paused ? " (en suspens)" : ""} (id ${t.id})`;
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
      return `Tâche ajoutée : ${t.title} (id ${t.id}).`;
    }
    case "terminer_tache": {
      const t: Data = await writeData(user, (d) => {
        const del = d.del || {};
        const open = (Array.isArray(d.todos) ? d.todos : []).filter((x: Data) => x && !del[x.id] && !x.done);
        const t = findOne(open, a.task, "la tâche");
        t.done = true;
        t.doneAt = new Date().toISOString();
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
      return list.slice(0, 40).map((n: Data) => `- ${n.title || "(sans titre)"} — ${String(n.body || "").replace(/\s+/g, " ").slice(0, 120)} (id ${n.id})`).join("\n");
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
        const n = { id: uid(), title: String(a.title || "").trim(), body: String(a.body || ""), createdAt: new Date().toISOString(), upd: Date.now() };
        d.notes.push(n);
        return n;
      });
      return `Note créée : ${n.title || "(sans titre)"} (id ${n.id}).`;
    }
    case "listes_partagees": {
      const lists = await myLists(user);
      if (!lists.length) return "Aucune liste partagée. On en crée une dans Sid'note : Organisation → Listes.";
      const { data: items } = await db.from("shared_items").select("list_id, text, done").in("list_id", lists.map((l) => l.id)).order("created_at");
      return lists.map((l) => {
        const it = (items || []).filter((i) => i.list_id === l.id);
        return `## ${l.name} (id ${l.id})\n` + (it.map((i) => `- [${i.done ? "x" : " "}] ${i.text}`).join("\n") || "(vide)");
      }).join("\n\n");
    }
    case "ajouter_a_une_liste": {
      const lists = await myLists(user);
      const k = String(a.list || "").trim();
      const l = lists.find((x) => x.id === k) || (() => {
        const m = lists.filter((x) => norm(x.name).includes(norm(k)));
        if (m.length === 1) return m[0];
        throw new Error(m.length ? `Plusieurs listes correspondent : ${m.map((x) => x.name).join(", ")}.` : `Aucune liste « ${k} ». Listes : ${lists.map((x) => x.name).join(", ") || "aucune"}.`);
      })();
      const items = (Array.isArray(a.items) ? a.items : [a.items]).map((s: unknown) => String(s || "").trim().slice(0, 200)).filter(Boolean);
      if (!items.length) throw new Error("Rien à ajouter.");
      const { error } = await db.from("shared_items").insert(items.map((text: string) => ({ list_id: l.id, text, by_name: nameOf })));
      if (error) throw error;
      return `Ajouté à « ${l.name} » : ${items.join(", ")}.`;
    }
  }
  throw new Error("Outil inconnu : " + name);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = new URL(req.url).pathname.split("/").filter(Boolean).pop() || "";
  if (key.length < 32) return json({ error: "Adresse incomplète : copie l'adresse complète depuis Sid'note (Réglages > Claude)." }, 404);
  const { data: tok } = await db.from("mcp_tokens").select("user_id, label").eq("hash", await sha256(key)).maybeSingle();
  if (!tok) return json({ error: "Clé inconnue ou retirée. Crée une nouvelle adresse dans Sid'note (Réglages > Claude)." }, 401);
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
        serverInfo: { name: "sidnote", title: "Sid'note", version: "1.0.0" },
        instructions: "Sid'note est l'application d'organisation de la personne (agenda, tâches, notes, listes partagées). Dates en AAAA-MM-JJ, heure de Bruxelles. Les mots de passe, documents et notes secrètes sont chiffrés et jamais accessibles.",
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
