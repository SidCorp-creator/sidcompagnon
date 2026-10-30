// Point d'entrée des écrans migrés : l'app actuelle (site/app.js) appelle window.SCIslands.<écran>(élément(s), props).
// Si ce fichier ne se charge pas, l'app garde son ancien rendu : rien ne casse.
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { NutritionCalendar, type NuCalProps } from "./NutritionCalendar";
import { ColChart, GrTable, KcalLegend, LineChart, MacroLegend, type LineOpt, type Serie } from "./Charts";
import { PomoStats } from "./PomoStats";
import { RevCard, WeeksHistory, type PastRev, type Rev } from "./Reviews";
import { MuGoal, NuMacros, type MacroRow } from "./Small";
import { AgendaChips, AgendaList, AgendaMonth, AgendaNext, AgendaYear, type AgI18n, type Chip } from "./Agenda";
import type { AgTask, GrDay, I18n, Tip } from "./types";
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

export interface AgPlanProps {
  tasks: AgTask[]; // data.tasks (« À venir »)
  list: AgTask[]; // activités filtrées et triées de « Toutes les dates »
  chips: Chip[];
  filter: string;
  search: boolean;
  open: string[]; // mois ouverts (planOpenMem)
  today: string;
  color: (t: AgTask) => string;
  icalCat: string;
  i18n: AgI18n;
}

declare global {
  interface Window {
    SCIslands?: {
      version: number;
      nuCal: (el: Element, p: NuCalProps) => void;
      graph: (els: GraphEls, p: GraphProps) => void;
      pomoStats: (el: Element, p: { todayMin: number; weekMin: number; i18n: I18n }) => void;
      reviews: (els: { day: Element; week: Element; weeks: Element }, p: { day: Rev | null; week: Rev | null; weeks: PastRev[]; busy: string; i18n: I18n }) => void;
      muGoal: (el: Element, p: { keys: string[]; goal: string; names: Record<string, string>; i18n: I18n }) => void;
      nuMacros: (el: Element, p: { rows: MacroRow[]; i18n: I18n }) => void;
      agMonth: (el: Element, p: { y: number; m: number; today: string; tasks: AgTask[]; color: (t: AgTask) => string; i18n: AgI18n }) => void;
      agYear: (el: Element, p: { y: number; today: string; tasks: AgTask[]; i18n: AgI18n }) => void;
      agPlan: (els: { next: Element; chips: Element; list: Element }, p: AgPlanProps) => void;
    };
  }
}
window.SCIslands = {
  version: 4,
  nuCal: (el, p) => mount(el, <NutritionCalendar {...p} />),
  graph,
  pomoStats: (el, p) => mount(el, <PomoStats {...p} />),
  reviews: (els, p) => {
    mount(els.day, <RevCard r={p.day} scope="day" busy={p.busy === "day"} i18n={p.i18n} />);
    mount(els.week, <RevCard r={p.week} scope="week" busy={p.busy === "week"} i18n={p.i18n} />);
    mount(els.weeks, <WeeksHistory weeks={p.weeks} i18n={p.i18n} />);
  },
  muGoal: (el, p) => mount(el, <MuGoal {...p} />),
  nuMacros: (el, p) => mount(el, <NuMacros {...p} />),
  agMonth: (el, p) => mount(el, <AgendaMonth {...p} />),
  agYear: (el, p) => mount(el, <AgendaYear {...p} />),
  agPlan: (els, p) => {
    mount(els.next, <AgendaNext tasks={p.tasks} today={p.today} color={p.color} i18n={p.i18n} />);
    mount(els.chips, <AgendaChips chips={p.chips} active={p.filter} i18n={p.i18n} />);
    mount(els.list, <AgendaList list={p.list} search={p.search} open={p.open} today={p.today} color={p.color} icalCat={p.icalCat} i18n={p.i18n} />);
  },
};
window.dispatchEvent(new Event("sc-islands"));
