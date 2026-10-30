// Point d'entrée des écrans migrés : l'app actuelle (site/app.js) appelle window.SCIslands.<écran>(élément(s), props).
// Si ce fichier ne se charge pas, l'app garde son ancien rendu : rien ne casse.
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { NutritionCalendar, type NuCalProps } from "./NutritionCalendar";
import { ColChart, GrTable, KcalLegend, LineChart, MacroLegend, type LineOpt, type Serie } from "./Charts";
import { PomoStats } from "./PomoStats";
import type { GrDay, I18n, Tip } from "./types";
import { fmtN, r1 } from "./format";

const roots = new WeakMap<Element, Root>();
// rendu synchrone (flushSync) : l'app peut lire le résultat juste après l'appel, comme avec l'ancien innerHTML.
// La classe notr protège ce DOM de la traduction automatique de l'app (les textes arrivent déjà traduits par L()).
function mount(el: Element, node: JSX.Element) {
  let r = roots.get(el);
  if (!r) { el.textContent = ""; el.classList.add("notr"); r = createRoot(el); roots.set(el, r); }
  flushSync(() => r!.render(node));
}

export interface GraphEls { macros: Element; weight: Element; kcal: Element; table: Element; macroLeg: Element; kcalLeg: Element }
export interface GraphProps {
  days: string[];
  D: GrDay[];
  macros: { k: "p" | "c" | "f"; label: string; c: string; goal?: number }[];
  targetWeight: number | null;
  widths: { macros: number; weight: number; kcal: number };
  i18n: I18n & { DOW: string[]; lang: string };
  tip: Tip;
}

function graph(els: GraphEls, p: GraphProps) {
  const { L, lang } = p.i18n;
  const series: Serie[] = p.macros.map((m) => ({ label: m.label, c: m.c, vals: p.D.map((d) => d.has ? r1(d[m.k]) : null) }));
  const mOpt: LineOpt = { zero: true, unit: " g", aria: L("Macros par jour") };
  const tw = p.targetWeight;
  const wOpt: LineOpt = { dots: true, unit: " kg", ref: tw ? { v: tw, label: `${L("Objectif")} ${fmtN(tw, lang)} kg` } : null, empty: "Entre ton poids ci-dessus pour suivre son évolution.", aria: L("Poids") };
  mount(els.macroLeg, <MacroLegend i18n={p.i18n} macros={p.macros} />);
  mount(els.macros, <LineChart i18n={p.i18n} width={p.widths.macros} days={p.days} series={series} opt={mOpt} tip={p.tip} />);
  mount(els.weight, <LineChart i18n={p.i18n} width={p.widths.weight} days={p.days} series={[{ label: "Poids", c: "--m-p", vals: p.D.map((d) => d.kg) }]} opt={wOpt} tip={p.tip} />);
  mount(els.kcalLeg, <KcalLegend i18n={p.i18n} />);
  mount(els.kcal, <ColChart i18n={p.i18n} width={p.widths.kcal} days={p.days} vals={p.D.map((d) => ({ k: d.has ? d.kcal : null, t: d.t }))} tip={p.tip} />);
  mount(els.table, <GrTable i18n={p.i18n} D={p.D} />);
}

declare global {
  interface Window {
    SCIslands?: {
      version: number;
      nuCal: (el: Element, p: NuCalProps) => void;
      graph: (els: GraphEls, p: GraphProps) => void;
      pomoStats: (el: Element, p: { todayMin: number; weekMin: number; i18n: I18n }) => void;
    };
  }
}
window.SCIslands = {
  version: 2,
  nuCal: (el, p) => mount(el, <NutritionCalendar {...p} />),
  graph,
  pomoStats: (el, p) => mount(el, <PomoStats {...p} />),
};
window.dispatchEvent(new Event("sc-islands"));
