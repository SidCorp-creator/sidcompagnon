// Construit site/app.js à partir des sources de app/src/shell/ (ordre dans ORDER.txt).
// Depuis la v71 (ticket #3), site/app.js est un fichier généré : on modifie les sources, puis « npm run build ».
// Les fichiers sont des scripts classiques mis bout à bout : ils partagent la même portée globale, comme l'ancien app.js.
// « node scripts/build-shell.mjs --check » vérifie seulement que site/app.js correspond aux sources (utilisé par tests/shell.test.js).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)), dir = join(here, "..", "src", "shell"), out = join(here, "..", "..", "site", "app.js");
const order = readFileSync(join(dir, "ORDER.txt"), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
const HEAD = "// Fichier généré à partir de app/src/shell/ (npm run build dans app/) : ne pas modifier ici.\n";
const text = HEAD + order.map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
if (process.argv.includes("--check")) {
  const cur = readFileSync(out, "utf8");
  if (cur !== text) { console.log("ÉCHEC : site/app.js ne correspond pas à app/src/shell/ (modifié à la main ? lance « npm run build » dans app/)"); process.exit(1); }
  console.log(`OK : site/app.js correspond aux sources (${order.length} fichiers)`);
} else {
  writeFileSync(out, text);
  console.log(`site/app.js : ${order.length} fichiers, ${text.split("\n").length - 1} lignes`);
}
