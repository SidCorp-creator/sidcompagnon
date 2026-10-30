// Point d'entrée des écrans migrés : l'app actuelle (site/app.js) appelle window.SCIslands.<écran>(élément, props).
// Si ce fichier ne se charge pas, l'app garde son ancien rendu : rien ne casse.
import { createRoot, type Root } from "react-dom/client";
import { NutritionCalendar, type NuCalProps } from "./NutritionCalendar";

const roots = new WeakMap<Element, Root>();
function mount(el: Element, node: JSX.Element) {
  let r = roots.get(el);
  if (!r) { el.textContent = ""; r = createRoot(el); roots.set(el, r); }
  r.render(node);
}

declare global {
  interface Window { SCIslands?: { version: number; nuCal: (el: Element, p: NuCalProps) => void } }
}
window.SCIslands = {
  version: 1,
  nuCal: (el, p) => mount(el, <NutritionCalendar {...p} />),
};
window.dispatchEvent(new Event("sc-islands"));
