// Test des rappels (fonction Supabase « rappels »), sans réseau.  Lance : node tests/rappels.test.js
const fs = require("fs"), path = require("path"), assert = require("assert"), ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "supabase", "functions", "rappels", "index.ts"), "utf8");
const block = src.split("// --- rappels : début")[1].split("// --- rappels : fin")[0].replace(/^[^\n]*\n/, "");
const js = ts.transpileModule(block + "\nmodule.exports={brusselsToUtc,dueReminders,whenText};", { compilerOptions: { target: "ES2020", module: "CommonJS" } }).outputText;
const m = { exports: {} }; new Function("module", "exports", js)(m, m.exports);
const { brusselsToUtc, dueReminders } = m.exports;
let ok = 0; const t = (n, f) => { f(); ok++; };
t("heure de Bruxelles (été et hiver)", () => {
  assert.strictEqual(new Date(brusselsToUtc("2026-07-01", "14:00")).toISOString(), "2026-07-01T12:00:00.000Z");
  assert.strictEqual(new Date(brusselsToUtc("2026-12-01", "14:00")).toISOString(), "2026-12-01T13:00:00.000Z");
});
const task = { id: "a", title: "Examen", date: "2026-12-10", time: "14:00", cat: "Cours" };
t("rappel 30 min avant, une seule fois dans la fenêtre", () => {
  const data = { tasks: [task], prefs: { notif: { leads: [30] } } };
  const at = brusselsToUtc("2026-12-10", "13:30");
  assert.strictEqual(dueReminders(data, at - 60000).length, 0);
  const r = dueReminders(data, at + 2 * 60000);
  assert.strictEqual(r.length, 1); assert.strictEqual(r[0].title, "Dans 30 min · Examen");
  assert.strictEqual(r[0].body, "14:00 · 10 déc. · Cours");
  assert.strictEqual(dueReminders(data, at + 20 * 60000).length, 0);
});
t("la veille par défaut, sans heure = 8 h", () => {
  const data = { tasks: [{ id: "b", title: "Sortie", date: "2026-12-10" }], prefs: {} };
  const r = dueReminders(data, brusselsToUtc("2026-12-09", "08:01"));
  assert.strictEqual(r.length, 1); assert.strictEqual(r[0].title, "Demain · Sortie");
});
t("tâche faite, annulée, cours iCal ou notifications coupées : rien", () => {
  const at = brusselsToUtc("2026-12-09", "14:01");
  for (const x of [{ status: "fait" }, { canc: true }, { src: "ical" }]) assert.strictEqual(dueReminders({ tasks: [{ ...task, ...x }] }, at).length, 0);
  assert.strictEqual(dueReminders({ tasks: [task], prefs: { notif: { on: false } } }, at).length, 0);
});
t("anglais", () => {
  const r = dueReminders({ tasks: [task], prefs: { lang: "en", notif: { leads: [2880] } } }, brusselsToUtc("2026-12-08", "14:00"));
  assert.strictEqual(r[0].title, "In 2 days · Examen"); assert.strictEqual(r[0].body, "14:00 · 10 Dec · Cours");
});
console.log(`OK : rappels, ${ok} tests réussis`);
