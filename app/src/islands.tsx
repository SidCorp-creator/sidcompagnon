// Point d'entrée des écrans migrés : l'app actuelle (site/app.js) appelle window.SCIslands.<écran>(élément(s), props).
// Si ce fichier ne se charge pas, l'app garde son ancien rendu : rien ne casse.
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { NutritionCalendar, type NuCalProps } from "./NutritionCalendar";
import { ColChart, GrTable, KcalLegend, LineChart, MacroLegend, type LineOpt, type Serie } from "./Charts";
import { PomoStats } from "./PomoStats";
import { RevCard, WeeksHistory, type PastRev, type Rev } from "./Reviews";
import { MuGoal, NuMacros, PlanBar, PomoPresets, type MacroRow } from "./Small";
import { AgendaChips, AgendaList, AgendaMonth, AgendaNext, AgendaYear, type AgI18n, type Chip } from "./Agenda";
import { CatBar, TodoCats, TodoDone, TodoOpen, TodoPaused, rowCtx, type TodosProps } from "./Todos";
import { DayView, type DayViewProps } from "./DayView";
import { MuList, type MuGrp, type MuI18n } from "./Muscu";
import { NuLog, NuResult, NuWeek, type Dish, type Mac, type NuI18n, type NuResultVM, type WeekSport } from "./Nutrition";
import { NoteList, NotesPath, type Icons, type NfVM, type NoteVM, type NotesI18n } from "./Notes";
import { DocFolders, DocList, PwList, type DocFolderVM, type DocVM, type PwVM, type VI18n } from "./Vault";
import { NuMenu, type MenuVM } from "./NuMenu";
import { HomeCards, type HcCard } from "./Home";
import { GoalBody, NuCopy, NuPlan, type GoalVM, type NuCopyVM, type PlanVM } from "./NuExtra";
import { AppHead, NavBar, SideBar, type NavItem, type NavI18n, type SideGroup, type SideIcons } from "./Shell";
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
      dayView: (el: Element, p: DayViewProps) => void;
      unmount: (el: Element) => void;
      nav: (el: Element, p: { items: NavItem[]; cur: string; i18n: NavI18n }) => void;
      appHead: (el: Element, p: { app: string; label: string; gridIcon: string; i18n: NavI18n }) => void;
      side: (el: Element, p: { groups: SideGroup[]; cur: string; icons: SideIcons; i18n: NavI18n }) => void;
      nuCopy: (el: Element, p: { c: NuCopyVM; MOL: string[]; i18n: NuI18n }) => void;
      nuGoal: (el: Element, p: { g: GoalVM | null; alert: string; i18n: NuI18n }) => void;
      nuPlan: (el: Element, p: { pl: PlanVM; alert: string; i18n: NuI18n }) => void;
      nuMenu: (el: Element, p: { m: MenuVM | null; mac: Mac[]; icons: { book: string }; i18n: NuI18n }) => void;
      home: (el: Element, p: { cards: HcCard[]; i18n: NuI18n }) => void;
      docs: (els: { folders: Element; list: Element }, p: { folders: DocFolderVM[]; cur: string; icon: string; grip: boolean; empty: string; docs: DocVM[]; i18n: VI18n }) => void;
      pwList: (el: Element, p: { items: PwVM[]; empty: string; i18n: VI18n }) => void;
      notes: (els: { path: Element; list: Element }, p: { path: NfVM[]; dirs: NfVM[]; inDir: boolean; search: boolean; empty: string; notes: NoteVM[]; icons: Icons; i18n: NotesI18n }) => void;
      nuLog: (el: Element, p: { dishes: Dish[]; mac: Mac[]; today: boolean; i18n: NuI18n }) => void;
      nuResult: (el: Element, p: { p: NuResultVM | null; mac: Mac[]; boltIcon: string; i18n: NuI18n }) => void;
      nuWeek: (el: Element, p: { sports: WeekSport[]; range: string; target: string; delta: number; actIcon: string; i18n: NuI18n }) => void;
      muList: (el: Element, p: { groups: MuGrp[]; trash: string; i18n: MuI18n }) => void;
      pomoPresets: (el: Element, p: { presets: number[]; total: number; labels: string[] }) => void;
      planBar: (el: Element, p: { segs: { t: string; d: number }[]; doneIdx: number }) => void;
      todos: (els: { cats: Element; bar: Element; open: Element; paused: Element; done: Element }, p: TodosProps) => void;
    };
  }
}
window.SCIslands = {
  version: 12,
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
  dayView: (el, p) => mount(el, <DayView {...p} />),
  muList: (el, p) => mount(el, <MuList {...p} />),
  // rend l'élément à l'ancien code (ex. #nuResult, où app.js pose aussi l'animation de chargement)
  unmount: (el) => { const r = roots.get(el); if (r) { r.unmount(); roots.delete(el); el.classList.remove("notr"); } },
  notes: (els, p) => {
    mount(els.path, <NotesPath path={p.path} i18n={p.i18n} />);
    mount(els.list, <NoteList dirs={p.dirs} inDir={p.inDir} notes={p.notes} search={p.search} empty={p.empty} icons={p.icons} i18n={p.i18n} />);
  },
  docs: (els, p) => {
    mount(els.folders, <DocFolders folders={p.folders} cur={p.cur} icon={p.icon} i18n={p.i18n} />);
    mount(els.list, <DocList docs={p.docs} grip={p.grip} empty={p.empty} icon={p.icon} i18n={p.i18n} />);
  },
  pwList: (el, p) => mount(el, <PwList {...p} />),
  nuMenu: (el, p) => mount(el, <NuMenu {...p} />),
  home: (el, p) => mount(el, <HomeCards {...p} />),
  nuCopy: (el, p) => mount(el, <NuCopy {...p} />),
  nuGoal: (el, p) => mount(el, p.g ? <GoalBody g={p.g} alert={p.alert} i18n={p.i18n} /> : <></>),
  nuPlan: (el, p) => mount(el, <NuPlan {...p} />),
  nav: (el, p) => mount(el, <NavBar {...p} />),
  appHead: (el, p) => mount(el, <AppHead {...p} />),
  side: (el, p) => mount(el, <SideBar {...p} />),
  nuLog: (el, p) => mount(el, <NuLog {...p} />),
  nuResult: (el, p) => mount(el, <NuResult {...p} />),
  nuWeek: (el, p) => mount(el, <NuWeek {...p} />),
  pomoPresets: (el, p) => mount(el, <PomoPresets {...p} />),
  planBar: (el, p) => mount(el, <PlanBar {...p} />),
  todos: (els, p) => {
    const x = rowCtx(p);
    mount(els.cats, <TodoCats p={p} />);
    mount(els.bar, <CatBar p={p} />);
    mount(els.open, <TodoOpen p={p} x={x} />);
    mount(els.paused, <TodoPaused p={p} x={x} />);
    mount(els.done, <TodoDone p={p} x={x} />);
  },
};
window.dispatchEvent(new Event("sc-islands"));
