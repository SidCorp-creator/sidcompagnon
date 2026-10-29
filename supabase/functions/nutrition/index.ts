// Sid'note v39 : fonction "nutrition" = mémoire des aliments seulement (plus aucun appel à Claude, plus de clé API).
// Depuis la v39, les calculs (aliments inconnus, photos, menus, recettes, bilans) sont faits par l'IA de chaque personne,
// branchée par le connecteur (fonction « mcp ») ; le profil est calculé dans l'app.
// Ici : « aliment » + texte → réponse depuis la mémoire partagée (tables food_answers et foods, voir supabase/sql/food_memory.sql),
// ou { result: null } si l'aliment n'est pas encore connu. Ouvert à toute personne connectée. Verify JWT : OFF.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (msg: string, status: number) => json({ error: msg }, status);

// ---------- mémoire des aliments (partagée) ----------
// Chaque aliment noté par une IA (avant la v39 : Claude ici ; depuis : l'IA de chacun, via la fonction « mcp ») est rangé dans la base (tables food_answers et foods, voir supabase/sql/food_memory.sql).
// Ensuite, la même phrase, ou le même aliment avec une autre quantité (« 200 g de riz cuit », « 3 oeufs »),
// est calculé depuis cette mémoire, sans appeler Claude : au fil du temps, la clé API sert de moins en moins.
// --- mémoire : début (fonctions pures, testées par tests/memory.test.js)
const fold = (s: string) => String(s || "").replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// texte normalisé d'une demande : « 150g de Riz cuit ! » → « 150 g de riz cuit »
const normText = (s: string) => fold(s).replace(/(\d)([a-z])/g, "$1 $2").replace(/[^a-z0-9.,]+/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["de", "du", "des", "d", "la", "le", "les", "l", "un", "une", "au", "aux", "of", "the", "a", "an", "some"]);
// nom d'aliment normalisé : « des Oeufs durs » → « oeuf dur »
function foodKey(s: string): string {
  return fold(s).replace(/[^a-z0-9]+/g, " ").trim().split(" ")
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 3 && /[sx]$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w))
    .join(" ");
}
// quantité + aliment : « 150 g de riz cuit » → {grams:150, food:"riz cuit"} ; « 2 oeufs » → {count:2, food:"oeufs"}
function parseQty(text: string): { grams?: number; count?: number; food: string } | null {
  const t = fold(text).replace(/(\d)([a-z])/g, "$1 $2").replace(/\s+/g, " ").trim();
  if (!t || t.length > 80 || /,(?!\d)|[+&;/]| et | and | avec | with | puis /.test(t)) return null; // plusieurs aliments : Claude
  const m = t.match(/^(\d+(?:[.,]\d+)?|un|une|a|an|one)\s*(kg|g|gr|grs|grammes?|grams?|ml|cl|l)?\.?\s+(?:d'|de |du |of )?(.+)$/);
  if (!m) return null;
  const n = /^\d/.test(m[1]) ? parseFloat(m[1].replace(",", ".")) : 1;
  const food = m[3].trim();
  if (!(n > 0) || !foodKey(food)) return null;
  const mult: Record<string, number> = { kg: 1000, l: 1000, cl: 10 };
  if (m[2]) return { grams: n * (mult[m[2]] || 1), food };
  return { count: n, food };
}
const r1 = (x: number) => Math.round(x * 10) / 10;
// réponse construite depuis un aliment de référence (valeurs pour 100 g)
function fromFood(f: any, q: { grams?: number; count?: number }): any | null {
  const g = q.grams ?? (q.count && f.unit_g ? q.count * Number(f.unit_g) : 0);
  if (!(g > 0)) return null;
  const k = g / 100, label = q.grams ? `${r1(g)} g` : `${q.count} × ${f.unit_label ? String(f.unit_label).replace(/^1\s*/, "") : "portion"} (${Math.round(g)} g)`;
  const item = { name: f.name, emoji: f.emoji || "", quantity: label, grams: Math.round(g),
    kcal: Math.round(f.kcal100 * k), protein_g: r1(f.p100 * k), carbs_g: r1(f.c100 * k), fat_g: r1(f.f100 * k) };
  return { dish: f.name, emoji: f.emoji || "🍽️", items: [item], note: "" };
}
// ce que la mémoire retient d'une réponse de Claude : aliments pour 100 g (+ alias tapé par l'utilisateur, + poids d'une unité)
function learnRows(query: string, lang: string, result: any): any[] {
  const rows: any[] = [], items = Array.isArray(result?.items) ? result.items : [];
  const per100 = (it: any) => ({ kcal100: r1(it.kcal * 100 / it.grams), p100: r1(it.protein_g * 100 / it.grams), c100: r1(it.carbs_g * 100 / it.grams), f100: r1(it.fat_g * 100 / it.grams) });
  for (const it of items) {
    if (!(it.grams > 0) || !foodKey(it.name)) continue;
    rows.push({ key: `${lang}:${foodKey(it.name)}`, name: it.name, emoji: it.emoji || "", ...per100(it), unit_g: null, unit_label: null });
  }
  const q = parseQty(query);
  if (q && items.length === 1 && items[0].grams > 0) {
    const it = items[0], alias = `${lang}:${foodKey(q.food)}`;
    const unit = q.count ? { unit_g: r1(it.grams / q.count), unit_label: q.count === 1 ? String(it.quantity || "") : "" } : { unit_g: null, unit_label: null };
    const same = rows.find((r) => r.key === alias);
    if (same) Object.assign(same, unit.unit_g ? unit : {});
    else rows.push({ key: alias, name: it.name, emoji: it.emoji || "", ...per100(it), ...unit });
  }
  return rows;
}
// --- mémoire : fin
async function fromMemory(text: string, lang: string): Promise<any | null> {
  const akey = `${lang}:${normText(text)}`;
  const { data: a } = await db.from("food_answers").select("result").eq("key", akey).maybeSingle();
  if (a?.result) { db.rpc("food_hit", { p_table: "answers", p_key: akey }).then(() => {}); return a.result; }
  const q = parseQty(text);
  if (!q) return null;
  const fkey = `${lang}:${foodKey(q.food)}`;
  const { data: f } = await db.from("foods").select("*").eq("key", fkey).maybeSingle();
  const res = f ? fromFood(f, q) : null;
  if (res) db.rpc("food_hit", { p_table: "foods", p_key: fkey }).then(() => {});
  return res;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who, error } = await db.auth.getUser(jwt);
  if (error || !who?.user) return fail("Non connecté", 401);
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* vide */ }
  const lang = body.lang === "en" ? "en" : body.lang === "nl" ? "nl" : "fr";
  if (body.kind !== "aliment" || typeof body.text !== "string" || !body.text.trim()) return json({ result: null, source: "none" });
  try {
    const mem = await fromMemory(body.text.slice(0, 600), lang);
    return json(mem ? { result: mem, source: "memory" } : { result: null, source: "none" });
  } catch (_) { return json({ result: null, source: "none" }); }
});
