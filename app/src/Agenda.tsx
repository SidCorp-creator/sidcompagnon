// sid'agenda migré en v53 (ticket #3) : grille du mois, vue année, « À venir », filtres et liste « Toutes les dates ».
// Même rendu que renderMonth / renderYear / renderPlan de site/app.js (mêmes classes et data-*) : les clics restent gérés par app.js.
// tr() = traduction de l'app avec les motifs (comme la traduction automatique du DOM, que la classe notr coupe ici).
import type { CSSProperties } from "react";
import { iso, monthCells, parse } from "./dates";
import type { AgTask } from "./types";

export interface AgI18n { tr: (fr: string) => string; L: (fr: string) => string; MOL: string[]; MO: string[]; locale: string }
type Css = CSSProperties & Record<string, string | number>;

const fmt = (d: string, MO: string[]) => { const x = parse(d); return x.getDate() + " " + MO[x.getMonth()]; };
const hrs = (t: AgTask) => t.time ? (t.timeEnd ? `${t.time}–${t.timeEnd}` : t.time) : "";
const sk = (t: AgTask) => t.date + (t.time || "99:99");
const daysTo = (d: string, today: string) => Math.round((+parse(d) - +parse(today)) / 864e5);
const cv = (c: string): Css => ({ "--c": `var(${c})` });

export function AgendaMonth({ y, m, today, tasks, color, i18n }: { y: number; m: number; today: string; tasks: AgTask[]; color: (t: AgTask) => string; i18n: AgI18n }) {
  const { tr, MOL } = i18n;
  return <>{monthCells(y, m).map((c, i) => {
    if (!c) return <span key={"o" + i} className="day out"></span>;
    const { k, d } = c;
    const per = tasks.filter((t) => t.end && t.date <= k && t.end >= k).slice(0, 2);
    const pts = tasks.filter((t) => !t.end && t.date === k).slice(0, 3);
    const n = per.length + tasks.filter((t) => !t.end && t.date === k).length;
    return <button key={k} className={`day ${k === today ? "today" : ""} ${k < today ? "past" : ""}`} data-day={k} aria-label={tr(`${d} ${MOL[m]}${n ? ", " + n + " élément(s)" : ""}`)}>
      <span className="num">{d}</span>
      <span className="marks">
        {per.length ? <span className="bars">{per.map((t, j) => <i key={j} className={`${t.date === k ? "s" : ""} ${t.end === k ? "e" : ""}`} style={cv(color(t))}></i>)}</span> : null}
        {pts.length ? <span className="dots">{pts.map((t, j) => <i key={j} style={{ ...cv(color(t)), opacity: t.status === "fait" || t.canc ? .35 : 1 }}></i>)}</span> : null}
      </span>
    </button>;
  })}</>;
}

export function AgendaYear({ y, today, tasks, i18n }: { y: number; today: string; tasks: AgTask[]; i18n: AgI18n }) {
  const { tr, MOL } = i18n;
  const has = new Set<string>();
  tasks.forEach((t) => { if (!t.date) return; const e = t.end && t.end > t.date ? t.end : t.date; for (let d = parse(t.date); iso(d) <= e; d.setDate(d.getDate() + 1)) has.add(iso(d)); });
  const now = parse(today);
  return <>
    <div className="yr-head">
      <button className="cal-nav" data-yrn="-1" aria-label={tr("Année précédente")}><span className="gi gi-chevl" aria-hidden="true" /></button>
      <button type="button" className="yr-title" data-yrtoday="1" aria-label={tr("Revenir au mois actuel")}>{y}<span className="yr-ic">{tr(`↩ ${i18n.L("Mois actuel")}`)}</span></button>
      <button className="cal-nav" data-yrn="1" aria-label={tr("Année suivante")}><span className="gi gi-chevr" aria-hidden="true" /></button>
    </div>
    <div className="yr-grid">{MOL.map((name, m) => <button key={m} className={`ym ${y === now.getFullYear() && m === now.getMonth() ? "cur" : ""}`} data-ym={m} aria-label={tr(`${name} ${y}`)}>
      <b>{tr(name)}</b>
      <div className="ym-g">{monthCells(y, m).map((c, i) => c
        ? <i key={c.k} className={`${c.k === today ? "td" : has.has(c.k) ? "ev" : ""} ${c.k < today ? "past" : ""}`}>{c.d}</i>
        : <i key={"o" + i}></i>)}</div>
    </button>)}</div>
    <p className="small muted" style={{ textAlign: "center", margin: "10px 0 4px" }}>{tr(i18n.L("Touche un mois pour l'ouvrir.") + " ")}<button type="button" className="linkbtn" data-yrtoday="1" style={{ background: "none", border: 0, cursor: "pointer" }}>{tr("Aujourd'hui")}</button></p>
  </>;
}

/** « À venir » : les 4 prochaines activités pas encore faites. */
export function AgendaNext({ tasks, today, color, i18n }: { tasks: AgTask[]; today: string; color: (t: AgTask) => string; i18n: AgI18n }) {
  const { tr, MO } = i18n;
  const up = tasks.filter((t) => t.status !== "fait" && daysTo(t.end || t.date, today) >= 0).sort((a, b) => sk(a).localeCompare(sk(b))).slice(0, 4);
  if (!up.length) return <div className="n" style={cv("--line")}><div className="t muted">{tr("Rien à venir")}</div></div>;
  return <>{up.map((t) => {
    const d = daysTo(t.date, today), w = d > 1 ? `dans ${d} j` : d === 1 ? "demain" : d === 0 ? "aujourd'hui" : "en cours";
    return <div key={t.id} className="n" style={cv(color(t))}><div className="d">{tr(`${fmt(t.date, MO)}${t.time ? " · " + hrs(t) : ""} · ${w}`)}</div><div className="t">{t.title}</div></div>;
  })}</>;
}

export interface Chip { name: string; c?: string }
export function AgendaChips({ chips, active, i18n }: { chips: Chip[]; active: string; i18n: AgI18n }) {
  return <>{chips.map((c) => <button key={c.name} className="pill" data-f={c.name} aria-pressed={c.name === active}>
    {c.c ? <span className="dot" style={{ background: `var(${c.c})` }}></span> : null}{i18n.tr(c.name)}
  </button>)}</>;
}

const CHEV = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;

/** Liste « Toutes les dates » groupée par mois (repliés sauf ceux de open ; tout ouvert pendant une recherche). */
export function AgendaList({ list, search, open, today, color, icalCat, i18n }: { list: AgTask[]; search: boolean; open: string[]; today: string; color: (t: AgTask) => string; icalCat: string; i18n: AgI18n }) {
  const { tr, L, MOL, MO, locale } = i18n;
  if (!list.length) return <div className="card" style={{ marginTop: "10px" }}><div className="empty">{tr(search ? "Aucune activité ne correspond." : "Rien dans cette catégorie.")}</div></div>;
  const g: Record<string, AgTask[]> = {};
  list.forEach((t) => { const d = parse(t.date), k = d.getFullYear() * 100 + d.getMonth(); (g[k] = g[k] || []).push(t); });
  const ks = Object.keys(g).sort(), shutK = (k: string) => !open.includes(k), allF = ks.every(shutK);
  const row = (t: AgTask) => {
    const d = parse(t.date);
    const dd = <div className="pr-date" aria-hidden="true"><b>{d.getDate()}</b><span className="notr">{d.toLocaleDateString(locale, { weekday: "short" })}</span></div>;
    if (t.src === "ical") return <div key={t.id} className={`row task prow ${t.canc ? "isfait" : ""}`} style={cv(color(t))} data-icalinfo={t.id}>{dd}
      <div className="grow pr-main"><div className="ttl">{t.title}</div><div className="pr-meta"><i className="pr-dot"></i><span className="notr">{t.cat || L(icalCat)}</span>{t.time ? " · " : null}{t.time ? <span className="pr-time">{hrs(t)}</span> : null}{t.canc ? <span className="canc-pill">{tr("Annulé")}</span> : null}{t.loc ? tr(` · ${t.loc}`) : null}</div></div></div>;
    const late = t.status !== "fait" && daysTo(t.end || t.date, today) < 0;
    const s1 = (t.cat || "") + (t.time ? " · " : ""), s2 = (t.end ? ` · → ${fmt(t.end, MO)}` : "") + (t.tbc ? " " : "");
    return <div key={t.id} className={`row task prow ${t.status === "fait" ? "isfait" : ""} ${late ? "is-past" : ""}`} style={cv(color(t))}>{dd}
      <div className="grow pr-main"><button type="button" className="ttl ttl-btn" data-edit={"task:" + t.id}>{t.title}</button>
        <div className="pr-meta"><i className="pr-dot"></i>{s1 ? tr(s1) : null}{t.time ? <span className="pr-time">{hrs(t)}</span> : null}{s2 ? tr(s2) : null}{t.tbc ? <button className="tbc" data-cf={t.id} title={tr("Toucher pour confirmer la date")}>{tr("à confirmer")}</button> : null}{late ? " " : null}{late ? <span className="past">{tr("Passé")}</span> : null}</div>
        {t.note ? <div className="pr-note">{tr(t.note)}</div> : null}</div>
      <button className="status" data-st={t.id} data-s={t.status}>{tr(t.status)}</button>
      <button type="button" className="pr-more" data-tmore2={t.id} aria-label={tr("Plus d'actions")}>⋯</button></div>;
  };
  return <>
    {ks.length > 1 && !search ? <div className="mfold-all"><button type="button" className="mini" data-mfoldall="1">{tr(allF ? "Tout déplier" : "Tout replier")}</button></div> : null}
    {ks.map((k) => {
      const shut = !search && shutK(k), n = +k;
      return [<button key={"h" + k} type="button" className="mfold" data-mfold={k} aria-expanded={!shut}><span className="mf-chev">{CHEV}</span><span className="grow">{tr(`${L(MOL[n % 100])} ${Math.floor(n / 100)}`)}</span><span className="mf-n">{g[k].length}</span></button>,
        shut ? null : <div key={"c" + k} className="card">{g[k].map(row)}</div>];
    })}
  </>;
}

// Élan : journée en liste, avec les mêmes data-* que le secours shell.
export interface JourneyVM {day:string;label:string;week:{day:string;label:string;num:number}[];items:{id:string;title:string;time:string;endTime:string;typeColor:string;meta:string;past:boolean;current:boolean;fresh:boolean;ical:boolean;done:boolean}[];check:string;more:string;prev:string;next:string;i18n:AgI18n}
export function JourneyDay({day,label,week,items,check,more,prev,next,i18n}:JourneyVM){const {tr,L}=i18n;
 return <><div className="journey-week" role="group" aria-label={tr(L("Choisir un jour"))}>{week.map(d=><button type="button" key={d.day} data-elan-day={d.day} aria-pressed={day===d.day}><span>{d.label}</span><b>{d.num}</b></button>)}</div>
 <button type="button" id="taskAdd" className="btn add-act">{tr(L("Ajouter une activité"))}</button><div className="journey-date"><button type="button" data-elan-day={prev} aria-label={tr(L("Jour précédent"))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button><h2>{label}</h2><button type="button" data-elan-day={next} aria-label={tr(L("Jour suivant"))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>
 <div className="journey-list">{items.length?items.map(t=><div key={t.id} className={`journey-row${t.past?' past':''}${t.current?' current':''}${t.fresh?' fresh':''}`}>
 <span className="journey-time"><span className={t.time?undefined:"all-day"}>{t.time||tr(L("Toute la journée"))}</span>{t.endTime?<small>{t.endTime}</small>:null}</span><button type="button" className="journey-content" {...(t.ical?{'data-icalinfo':t.id}:{'data-edit':`task:${t.id}`})}><b className="notr">{t.title}</b><span className="muted notr">{t.typeColor?<i className="journey-type-dot" aria-hidden="true" style={{background:`var(${t.typeColor})`}}/>:null}{t.meta}</span></button>
 {t.ical?<span aria-label={tr(L("Calendrier relié"))}/>:<button type="button" className={`journey-state${t.done?" done":""}`} aria-pressed={t.done} data-st={t.id} data-s={t.done?'fait':'à faire'} aria-label={tr(L(t.done?'Faite':'Marquer comme faite'))} dangerouslySetInnerHTML={{__html:t.done?check:more}}/>}</div>):<div className="journey-empty">{tr(L("Rien de prévu ce jour-ci"))}</div>}</div></>;
}
