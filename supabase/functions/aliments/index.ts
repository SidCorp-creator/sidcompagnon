// Sid'compagnon v81 : fonction "aliments" = relais vers Open Food Facts (produits emballés : recherche par nom, fiche par code-barres).
// Pourquoi un relais : Open Food Facts demande un User-Agent identifié (le navigateur ne peut pas le poser), son service de recherche
// n'autorise pas notre site en CORS, et ses quotas sont par adresse IP (15 fiches/min, 10 recherches/min) : on met en cache 24 h et on limite
// chaque personne. Les aliments génériques (Ciqual, Anses) sont cherchés dans l'app, sans réseau.
// Données Open Food Facts : licence ODbL (base) / DbCL (contenu) — mention « Open Food Facts » obligatoire dans l'app.
// Réservé aux personnes connectées (JWT de session vérifié comme dans « horaire »). Verify JWT : OFF. Aucun secret.
// POST {query} → {items:[{code,name,brand}]} ; POST {code} → {product:{code,name,brand,kcal,p,c,f,basis,servingGrams?,servingMl?,url}}
// Erreurs (HTTP 200) : {error:"introuvable"|"indisponible"|"quota"|"demande"}.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
const UA = "SidCompagnon/81 (https://sidcompagnon.com)";
const TTL = 24 * 3600e3, PER_MIN = 30;

// --- fonctions pures (testées par tests/aliments.test.mjs) : début
// deno-lint-ignore no-explicit-any
type Any = any;
const num = (x: unknown) => { const n = typeof x === "string" ? parseFloat(x.replace(",", ".")) : Number(x); return Number.isFinite(n) ? Math.round(n * 10) / 10 : null; };
export const cleanCode = (c: unknown) => { const s = String(c ?? "").replace(/\D/g, ""); return s.length >= 8 && s.length <= 14 ? s : ""; };
export const cleanQuery = (q: unknown) => String(q ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
// fiche v2 (champ nutriments, le plus stable) → format commun ; null si les valeurs principales manquent
export function toProduct(p: Any, code: string) {
  if (!p) return null;
  const n = p.nutriments || {};
  let kcal = num(n["energy-kcal_100g"]);
  if (kcal === null && num(n["energy-kj_100g"]) !== null) kcal = Math.round((num(n["energy-kj_100g"])! / 4.184) * 10) / 10;
  if (kcal === null) return null;
  const liquid = /ml|cl|l\b/i.test(String(p.quantity || "") + " " + String(p.serving_size || "")) && /boisson|beverage|drink|soda|jus|juice|lait|milk|water|eau/i.test(String(p.categories || "") + " " + String((p.categories_tags || []).join(" ")));
  const sq = num(p.serving_quantity), su = String(p.serving_quantity_unit || "").toLowerCase();
  const out: Any = {
    code, name: String(p.product_name_fr || p.product_name || p.generic_name_fr || "").trim() || code, brand: String(p.brands || "").split(",")[0].trim(),
    kcal, p: num(n.proteins_100g) ?? 0, c: num(n.carbohydrates_100g) ?? 0, f: num(n.fat_100g) ?? 0,
    basis: liquid || n.nutrition_data_per === "100ml" ? "100ml" : "100g",
    url: `https://world.openfoodfacts.org/product/${code}`,
  };
  if (sq && sq > 0) { if (su === "ml" || (out.basis === "100ml" && su !== "g")) out.servingMl = sq; else out.servingGrams = sq; }
  if (p.serving_size) out.servingLabel = String(p.serving_size).slice(0, 40);
  return out;
}
export const toItems = (hits: Any[]) => (Array.isArray(hits) ? hits : []).filter((h) => h && cleanCode(h.code)).slice(0, 10)
  .map((h) => ({ code: String(h.code), name: String(Array.isArray(h.product_name) ? h.product_name[0] : h.product_name || "").trim() || String(h.code), brand: String(Array.isArray(h.brands) ? h.brands[0] : h.brands || "").split(",")[0].trim() }));
// --- fonctions pures : fin

const cache = new Map<string, { at: number; v: unknown }>(), hits = new Map<string, number[]>();
const cached = (k: string) => { const c = cache.get(k); return c && Date.now() - c.at < TTL ? c.v : undefined; };
const keep = (k: string, v: unknown) => { if (cache.size > 2000) cache.delete(cache.keys().next().value!); cache.set(k, { at: Date.now(), v }); };
function allowed(user: string) { const now = Date.now(), a = (hits.get(user) || []).filter((t) => now - t < 6e4); if (a.length >= PER_MIN) return false; a.push(now); hits.set(user, a); return true; }
async function get(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (r.status === 429) throw new Error("quota");
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("indisponible");
  return await r.json();
}

if (import.meta.main) Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "demande" }, 405);
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data?.user) return json({ error: "Non connecté" }, 401);
  let body: Any = {};
  try { body = await req.json(); } catch { /* vide */ }
  const code = cleanCode(body.code), query = cleanQuery(body.query);
  if (!code && query.length < 2) return json({ error: "demande" });
  const key = code ? "c:" + code : "q:" + query.toLowerCase();
  const hit = cached(key);
  if (hit !== undefined) return json(hit);
  if (!allowed(data.user.id)) return json({ error: "quota" });
  try {
    let out: unknown;
    if (code) {
      const fields = "product_name,product_name_fr,generic_name_fr,brands,quantity,serving_size,serving_quantity,serving_quantity_unit,nutriments,nutrition_data_per,categories,categories_tags";
      const j = await get(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`);
      const p = j && j.status === 1 ? toProduct(j.product, code) : null;
      out = p ? { product: p } : { error: "introuvable" };
    } else {
      const j = await get(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&langs=fr,en&page_size=10&fields=code,product_name,brands`);
      const items = toItems(j && j.hits);
      out = items.length ? { items } : { items: [], error: "introuvable" };
    }
    keep(key, out);
    return json(out);
  } catch (e) {
    const m = (e as Error).message;
    return json({ error: m === "quota" ? "quota" : "indisponible" });
  }
});
