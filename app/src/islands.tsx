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
import { MuList, MuStats, type MuGrp, type MuI18n, type MuStatsVM } from "./Muscu";
import { NuLog, NuResult, NuWeek, type Dish, type Mac, type NuI18n, type NuResultVM, type WeekSport } from "./Nutrition";
import { NoteList, NotesPath, type Icons, type NfVM, type NoteVM, type NotesI18n } from "./Notes";
import { DocFolders, DocList, PwList, type DocFolderVM, type DocVM, type PwVM, type VI18n } from "./Vault";
import { NuMenu, type MenuVM } from "./NuMenu";
import { HomeCards, type HcCard } from "./Home";
import { GoalBody, NuCopy, NuPlan, type GoalVM, type NuCopyVM, type PlanVM } from "./NuExtra";
import { AppHead, NavBar, SideBar, type NavItem, type NavI18n, type SideGroup, type SideIcons } from "./Shell";
import { ExHelp, McpList, QuickAdd, Stats, TabsCard, TypesCard, type ExHelpVM, type SI18n, type TabGroup } from "./Settings";
import { Keypad, OnbDots, OnbGroups, OnbPal, type OI18n, type OnbGroup, type PalVM } from "./Onboarding";
import { AuthFeats, FolderBar, NsBar, NuKcalOf, NuMealKcal, NuMkTot, NuSlots, NuSports, type FI18n } from "./Forms";
import { NotePhotos, PvOpts, PvOverlay, RtMenu, type PI18n, type PvAnn } from "./PdfView";
import { ActList, AiState, BkList, NuAiCard, TypeChips, CalLegend, CalList, HomeSync, LegalBody, SyncState, type CalVM, type WI18n } from "./Sheets";
import { CfRes, CfSel, CoachCard, type CI18n, type CoachVM } from "./Coach";
import { NotifBox, RemBox, type Lead, type NI18n } from "./Notif";
import { AaActs, AiWizard, NuPhotoPrev, ScanPages, type AaVM, type AI18n, type AiVM } from "./AiWizard";
import { AppStatus, CalTitle, NuEHint, QuickHint, SpotEmbed, Toast, type MI18n } from "./Misc";
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
      authFeats: (el: Element, p: { items: { icon: string; t: string; d: string }[]; i18n: FI18n }) => void;
      nsBar: (el: Element, p: { unlock: string; lock: string; i18n: FI18n }) => void;
      folderBar: (el: Element, p: { name: string; count: number; editing: boolean; q: string; icon: string; i18n: FI18n }) => void;
      nuSports: (el: Element, p: { sports: { name: string; freq: string; dur: string }[]; i18n: FI18n }) => void;
      nuSlots: (el: Element, p: { slots: { k: string; on: boolean; icon: string; name: string }[]; i18n: FI18n }) => void;
      nuMealKcal: (el: Element, p: { rows: { icon: string; name: string; kcal: number }[]; i18n: FI18n }) => void;
      nuMkTot: (el: Element, p: { tot: string; tg: string; reset: boolean; i18n: FI18n }) => void;
      nuKcalOf: (el: Element, p: { target: number; over: number; left: number; i18n: FI18n }) => void;
      pvOverlay: (el: Element, p: { anns: PvAnn[]; viewBox: string; grip: string; i18n: PI18n }) => void;
      rtMenu: (el: Element, p: { items: { c: string; l: string; sw: boolean }[]; i18n: PI18n }) => void;
      notePhotos: (el: Element, p: { photos: { id: string; u?: string | null }[]; i18n: PI18n }) => void;
      syncState: (el: Element, p: { st: string; i18n: WI18n }) => void;
      homeSync: (el: Element, p: { msg: string; i18n: WI18n }) => void;
      actList: (el: Element, p: { items: { l: string; danger?: boolean; on?: boolean }[]; check: string; i18n: WI18n }) => void;
      calList: (el: Element, p: { cals: CalVM[]; more: string; i18n: WI18n }) => void;
      calLegend: (el: Element, p: { cals: CalVM[] }) => void;
      bkList: (el: Element, p: { rows: { lb: string; n: number; now: number }[]; i18n: WI18n }) => void;
      aiState: (el: Element, p: { ok: boolean; i18n: WI18n }) => void;
      nuAiCard: (el: Element, p: { ok: boolean; icon: string; href: string; name: string; i18n: WI18n }) => void;
      typeChips: (el: Element, p: { types: { name: string; c: string }[]; cur: string; i18n: WI18n }) => void;
      coach: (el: Element, p: { c: CoachVM | null; more: string; i18n: CI18n }) => void;
      cfSel: (el: Element, p: { names: string[]; i18n: CI18n }) => void;
      cfRes: (el: Element, p: { q: boolean; hits: { n: string; grp: string; p: boolean }[]; i18n: CI18n }) => void;
      notifBox: (el: Element, p: { kind: "na" | "on" | "off"; msg: string; leads: Lead[]; custom: boolean; cals: boolean; ical: boolean; i18n: NI18n }) => void;
      remBox: (el: Element, p: { kind: "na" | "on" | "off"; msg: string; leads: Lead[]; custom: boolean; bell: string; i18n: NI18n }) => void;
      aiWizard: (el: Element, p: { w: AiVM; i18n: AI18n }) => void;
      aaActs: (el: Element, p: { a: AaVM; i18n: AI18n }) => void;
      nuPhotoPrev: (el: Element, p: { src: string; i18n: AI18n }) => void;
      scanPages: (el: Element, p: { pages: string[]; i18n: AI18n }) => void;
      toast: (el: Element, p: { m: string; label: string; onAct: (() => void) | null; i18n: MI18n }) => void;
      calTitle: (el: Element, p: { mo: string; y: number; i18n: MI18n }) => void;
      quickHint: (el: Element, p: { icon: string; title: string; when: string; i18n: MI18n }) => void;
      nuEHint: (el: Element, p: { st: "ok" | "none" | "busy"; i18n: MI18n }) => void;
      spotEmbed: (el: Element, p: { ok: boolean; src: string; i18n: MI18n }) => void;
      appStatus: (el: Element, p: { ok: boolean; i18n: MI18n }) => void;
      muStats: (el: Element, p: { vm: MuStatsVM; i18n: MuI18n }) => void;
      legalBody: (el: Element, p: { parts: [string, string][]; page: string; i18n: WI18n }) => void;
      pvOpts: (el: Element, p: { cols: string[]; cur: string; size: number; dot: React.CSSProperties; i18n: PI18n }) => void;
      onbGroups: (el: Element, p: { groups: OnbGroup[]; i18n: OI18n }) => void;
      onbDots: (el: Element, p: { n: number; cur: number }) => void;
      keypad: (el: Element, p: { attr: "pin" | "ps"; del: string }) => void;
      onbPal: (el: Element, p: { pals: PalVM[]; check: string; i18n: OI18n }) => void;
      stats: (el: Element, p: { rows: [string, string | number][]; i18n: SI18n }) => void;
      tabsCard: (el: Element, p: { groups: TabGroup[]; i18n: SI18n }) => void;
      typesCard: (el: Element, p: { types: { name: string; c: string; n: number }[]; i18n: SI18n }) => void;
      mcpList: (el: Element, p: { rows: { hash: string; created: string; used: string }[]; i18n: SI18n }) => void;
      quickAdd: (el: Element, p: { acts: { k: string; t: string; s: string; icon: string }[]; i18n: SI18n }) => void;
      exHelp: (el: Element, p: { h: ExHelpVM; i18n: SI18n }) => void;
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
  version: 21,
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
  stats: (el, p) => mount(el, <Stats {...p} />),
  tabsCard: (el, p) => mount(el, <TabsCard {...p} />),
  typesCard: (el, p) => mount(el, <TypesCard {...p} />),
  mcpList: (el, p) => mount(el, <McpList {...p} />),
  quickAdd: (el, p) => mount(el, <QuickAdd {...p} />),
  exHelp: (el, p) => mount(el, <ExHelp {...p} />),
  onbGroups: (el, p) => mount(el, <OnbGroups {...p} />),
  onbDots: (el, p) => mount(el, <OnbDots {...p} />),
  keypad: (el, p) => mount(el, <Keypad {...p} />),
  onbPal: (el, p) => mount(el, <OnbPal {...p} />),
  authFeats: (el, p) => mount(el, <AuthFeats {...p} />),
  nsBar: (el, p) => mount(el, <NsBar {...p} />),
  folderBar: (el, p) => mount(el, <FolderBar {...p} />),
  nuSports: (el, p) => mount(el, <NuSports {...p} />),
  nuSlots: (el, p) => mount(el, <NuSlots {...p} />),
  nuMealKcal: (el, p) => mount(el, <NuMealKcal {...p} />),
  nuMkTot: (el, p) => mount(el, <NuMkTot {...p} />),
  nuKcalOf: (el, p) => mount(el, <NuKcalOf {...p} />),
  pvOverlay: (el, p) => mount(el, <PvOverlay {...p} />),
  pvOpts: (el, p) => mount(el, <PvOpts {...p} />),
  rtMenu: (el, p) => mount(el, <RtMenu {...p} />),
  syncState: (el, p) => mount(el, <SyncState {...p} />),
  homeSync: (el, p) => mount(el, <HomeSync {...p} />),
  actList: (el, p) => mount(el, <ActList {...p} />),
  calList: (el, p) => mount(el, <CalList {...p} />),
  calLegend: (el, p) => mount(el, <CalLegend {...p} />),
  bkList: (el, p) => mount(el, <BkList {...p} />),
  legalBody: (el, p) => mount(el, <LegalBody {...p} />),
  muStats: (el, p) => mount(el, <MuStats {...p} />),
  toast: (el, p) => mount(el, <Toast {...p} />),
  calTitle: (el, p) => mount(el, <CalTitle {...p} />),
  quickHint: (el, p) => mount(el, <QuickHint {...p} />),
  nuEHint: (el, p) => mount(el, <NuEHint {...p} />),
  spotEmbed: (el, p) => mount(el, <SpotEmbed {...p} />),
  appStatus: (el, p) => mount(el, <AppStatus {...p} />),
  aaActs: (el, p) => mount(el, <AaActs {...p} />),
  nuPhotoPrev: (el, p) => mount(el, <NuPhotoPrev {...p} />),
  scanPages: (el, p) => mount(el, <ScanPages {...p} />),
  aiWizard: (el, p) => mount(el, <AiWizard {...p} />),
  notifBox: (el, p) => mount(el, <NotifBox {...p} />),
  remBox: (el, p) => mount(el, <RemBox {...p} />),
  coach: (el, p) => mount(el, <CoachCard {...p} />),
  cfSel: (el, p) => mount(el, <CfSel {...p} />),
  cfRes: (el, p) => mount(el, <CfRes {...p} />),
  aiState: (el, p) => mount(el, <AiState {...p} />),
  nuAiCard: (el, p) => mount(el, <NuAiCard {...p} />),
  typeChips: (el, p) => mount(el, <TypeChips {...p} />),
  notePhotos: (el, p) => mount(el, <NotePhotos {...p} />),
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
