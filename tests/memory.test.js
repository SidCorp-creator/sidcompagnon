// Test de la mémoire des aliments (fonction Supabase « nutrition »), sans réseau ni Claude.
// Lance :  node tests/memory.test.js   (prérequis : npm i -D typescript)
// On extrait les fonctions pures entre « mémoire : début » et « mémoire : fin », on les transpile, puis on vérifie.
const fs = require("fs"), path = require("path"), assert = require("assert");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "supabase", "functions", "nutrition", "index.ts"), "utf8");
const block = src.split("// --- mémoire : début")[1].split("// --- mémoire : fin")[0].replace(/^[^\n]*\n/, "");
const js = ts.transpileModule(block + "\nmodule.exports={fold,normText,foodKey,parseQty,fromFood,learnRows};", { compilerOptions: { target: "ES2020", module: "CommonJS" } }).outputText;
const m = { exports: {} };
new Function("module", "exports", js)(m, m.exports);
const { normText, foodKey, parseQty, fromFood, learnRows } = m.exports;
let ok = 0;
const t = (name, fn) => { fn(); ok++; };

t("texte normalisé", () => {
  assert.strictEqual(normText("150g de Riz cuit !"), "150 g de riz cuit");
  assert.strictEqual(normText("  2 Œufs  "), "2 oeufs");
});
t("nom d'aliment normalisé", () => {
  assert.strictEqual(foodKey("des Oeufs durs"), "oeuf dur");
  assert.strictEqual(foodKey("Riz blanc cuit"), "riz blanc cuit");
  assert.strictEqual(foodKey("de riz"), "riz");
});
t("quantités", () => {
  assert.deepStrictEqual(parseQty("150 g de riz cuit"), { grams: 150, food: "riz cuit" });
  assert.deepStrictEqual(parseQty("150g riz cuit"), { grams: 150, food: "riz cuit" });
  assert.deepStrictEqual(parseQty("0,5 kg de pâtes"), { grams: 500, food: "pates" });
  assert.deepStrictEqual(parseQty("2 oeufs"), { count: 2, food: "oeufs" });
  assert.deepStrictEqual(parseQty("une banane"), { count: 1, food: "banane" });
  assert.deepStrictEqual(parseQty("25 cl de jus d'orange"), { grams: 250, food: "jus d'orange" });
  assert.strictEqual(parseQty("riz et poulet"), null);         // plusieurs aliments : Claude
  assert.deepStrictEqual(parseQty("une assiette de pâtes"), { count: 1, food: "assiette de pates" }); // « 1 assiette de pâtes » : reconnu une fois appris
  assert.strictEqual(parseQty("des pâtes"), null);             // pas de quantité : seulement la mémoire exacte
});
t("apprentissage puis calcul sans Claude (grammes)", () => {
  const claude = { dish: "Riz", emoji: "🍚", items: [{ name: "Riz blanc cuit", emoji: "🍚", quantity: "150 g", grams: 150, kcal: 195, protein_g: 4.1, carbs_g: 42.3, fat_g: 0.5 }], note: "" };
  const rows = learnRows("150 g de riz cuit", "fr", claude);
  const alias = rows.find((r) => r.key === "fr:riz cuit");
  assert.ok(alias, "alias « riz cuit » retenu");
  assert.ok(rows.find((r) => r.key === "fr:riz blanc cuit"), "nom de Claude retenu");
  assert.strictEqual(alias.kcal100, 130);
  const res = fromFood(alias, parseQty("200 g de riz cuit"));
  assert.strictEqual(res.items[0].kcal, 260);
  assert.strictEqual(res.items[0].grams, 200);
});
t("apprentissage puis calcul sans Claude (unités)", () => {
  const claude = { dish: "Oeufs", emoji: "🥚", items: [{ name: "Oeuf dur", emoji: "🥚", quantity: "2 oeufs", grams: 100, kcal: 155, protein_g: 12.6, carbs_g: 1.1, fat_g: 10.6 }], note: "" };
  const rows = learnRows("2 oeufs", "fr", claude), egg = rows.find((r) => r.key === "fr:oeuf");
  assert.strictEqual(egg.unit_g, 50);
  const res = fromFood(egg, parseQty("3 oeufs"));
  assert.strictEqual(res.items[0].grams, 150);
  assert.strictEqual(res.items[0].kcal, 233);
  assert.strictEqual(fromFood({ ...egg, unit_g: null }, parseQty("3 oeufs")), null); // poids d'une unité inconnu : Claude
});
t("plusieurs aliments : chacun est retenu", () => {
  const claude = { items: [{ name: "Poulet grillé", grams: 120, kcal: 198, protein_g: 37, carbs_g: 0, fat_g: 4.3 }, { name: "Brocoli", grams: 0, kcal: 20, protein_g: 2, carbs_g: 3, fat_g: 0 }] };
  const rows = learnRows("poulet et brocoli", "fr", claude);
  assert.deepStrictEqual(rows.map((r) => r.key), ["fr:poulet grille"]); // grammes inconnus : pas retenu
});
console.log(`OK : mémoire des aliments, ${ok} tests réussis`);
