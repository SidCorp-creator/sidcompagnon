// sid'agenda → vue d'un jour, migrée en v54 (ticket #3) : en-tête, activités sur la journée, tâches du jour, frise horaire, ajout rapide.
// Même rendu que renderDayView / dayTasksBox de site/app.js : les clics et les formulaires restent gérés par app.js.
import type { CSSProperties } from "react";
import { iso, parse } from "./dates";
import type { AgTask, Todo } from "./types";
import type { AgI18n } from "./Agenda";

type Css = CSSProperties & Record<string, string | number>;
const two = (n: number) => String(n).padStart(2, "0");
const toMin = (h?: string) => { if (!h) return null; const [a, b] = h.split(":").map(Number); return a * 60 + b; };
const hrs = (t: AgTask) => t.time ? (t.timeEnd ? `${t.time}–${t.timeEnd}` : t.time) : "";
const sk = (t: AgTask) => t.date + (t.time || "99:99");
const onDay = (t: AgTask, k: string) => t.date === k || (!!t.end && t.date <= k && t.end >= k);
const fmt = (d: string, MO: string[]) => { const x = parse(d); return x.getDate() + " " + MO[x.getMonth()]; };
const CHECK = <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const PEN = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>;
const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface DayViewProps {
  day: string; // AAAA-MM-JJ
  today: string;
  tasks: AgTask[]; // activités et événements des calendriers reliés
  todos: Todo[] | null; // tâches du jour (null si Tâches est masqué)
  qOpen: boolean; // formulaire d'ajout rapide ouvert
  nowMin: number; // minutes depuis minuit (ligne « maintenant »)
  color: (t: AgTask) => string;
  checkIcon: string; // icône de « Tâches du jour » (SVG de l'app)
  i18n: AgI18n & { DOW: string[]; lang: string };
}

function DayTasks({ p }: { p: DayViewProps }) {
  const { tr, L } = p.i18n, k = p.day, list = p.todos!, past = k < p.today;
  return <div className="card dt-box">
    <div className="dt-h"><b dangerouslySetInnerHTML={{ __html: `${p.checkIcon} ${escHtml(tr(L("Tâches du jour")))}` }}></b><span className="small muted">{`${list.filter((t) => t.done).length}/${list.length}`}</span></div>
    {list.length ? list.map((t) => <div key={t.id} className={`dt-row ${t.done ? "done" : ""}`}>
      <button type="button" className="check" data-dtg={t.id} aria-label={tr(L(t.done ? "Remettre à faire" : "Terminer"))}>{t.done ? CHECK : null}</button>
      <button type="button" className="grow ttl ttl-btn" data-dtmore={t.id}>{t.title}{!t.done && t.day && t.day < p.today ? <>{" "}<span className="tchip late">{`↻ ${L("reportée")}`}</span></> : null}</button>
    </div>) : <div className="small muted dt-empty">{tr(L(past ? "Aucune tâche ce jour-là." : "Aucune tâche prévue. Ajoute-en une ci-dessous."))}</div>}
    {past ? null : <form className="dt-add" data-dtadd={k}><input placeholder={tr(L("+ Tâche pour ce jour"))} aria-label={tr(L("Nouvelle tâche pour ce jour"))} autoComplete="off" enterKeyHint="done" /></form>}
  </div>;
}

export function DayView(p: DayViewProps) {
  const { tr, MOL, MO, DOW, lang } = p.i18n, k = p.day, sd = parse(k);
  const mlow = (i: number) => lang === "en" ? MOL[i] : MOL[i].toLowerCase();
  const items = p.tasks.filter((t) => onDay(t, k)).sort((a, b) => sk(a).localeCompare(sk(b)));
  const timed = items.filter((t) => t.time && t.date === k), allday = items.filter((t) => !(t.time && t.date === k));
  // plage horaire affichée
  let H0 = 7, H1 = 22;
  timed.forEach((t) => { const s = toMin(t.time)!, e = Math.max(toMin(t.timeEnd) || 0, s + 60); H0 = Math.min(H0, Math.floor(s / 60)); H1 = Math.max(H1, Math.min(24, Math.ceil(e / 60))); });
  const PX = 48;
  // colonnes pour les activités qui se chevauchent
  const ev = timed.map((t) => { const s = toMin(t.time)!; let e = toMin(t.timeEnd); if (e === null || e <= s) e = s + 60; return { t, s, e, col: 0 }; }).sort((a, b) => a.s - b.s);
  const ends: number[] = []; ev.forEach((x) => { let c = ends.findIndex((e) => e <= x.s); if (c < 0) { c = ends.length; ends.push(0); } ends[c] = x.e; x.col = c; });
  const ncol = Math.max(1, ends.length);
  const hours = []; for (let hh = H0; hh <= H1; hh++) hours.push(<div key={"h" + hh} className="hr" style={{ top: `${(hh - H0) * PX}px` }}><span>{`${two(hh % 24)}:00`}</span></div>);
  const prev = new Date(sd); prev.setDate(prev.getDate() - 1); const nxt = new Date(sd); nxt.setDate(nxt.getDate() + 1);
  const m = p.nowMin, now = k === p.today && m >= H0 * 60 && m <= H1 * 60 ? <div className="nowline" style={{ top: `${(m / 60 - H0) * PX}px` }}></div> : null;
  return <>
    <div className="dayv-head">
      <button className="back" id="dayBack">{tr(`‹ ${MOL[sd.getMonth()]}`)}</button>
      <div className="dayv-title">{tr(`${DOW[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())}${k === p.today ? " · aujourd'hui" : ""}`)}</div>
      <button className="cal-nav" data-dayjump={iso(prev)} aria-label={tr("Jour précédent")}>‹</button><button className="cal-nav" data-dayjump={iso(nxt)} aria-label={tr("Jour suivant")}>›</button>
    </div>
    {allday.length ? <div className="allday">{allday.map((t) => <div key={t.id} className={`chip-ev ${t.canc ? "canc" : ""}`} style={{ "--c": `var(${p.color(t)})` } as Css}>
      <span className="grow ttl" style={t.status === "fait" ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}>{t.time ? <><span className="time">{hrs(t)}</span>{" "}</> : null}{t.title}{t.end ? <>{" "}<span className="small muted">{`· ${fmt(t.date, MO)} → ${fmt(t.end, MO)}`}</span></> : null}</span>
      {t.src === "ical" ? (t.canc ? <span className="canc-pill">{tr("Annulé")}</span> : null) : <><button className="pen" data-edit={"task:" + t.id} aria-label={tr("Modifier")}>{PEN}</button><button className="x" data-caldel={t.id} aria-label={tr("Supprimer")}>×</button></>}
    </div>)}</div> : null}
    {p.todos ? <DayTasks p={p} /> : null}
    {!items.length ? <p className="small muted" style={{ margin: "0 4px 8px" }}>{tr("Rien de prévu ce jour-là.")}</p> : null}
    <div className="tline" style={{ height: `${(H1 - H0) * PX}px` }}>{hours}
      {ev.map((x) => <button key={x.t.id} className={`blk ${x.t.status === "fait" ? "fait" : ""} ${x.t.canc ? "canc" : ""}`} {...(x.t.src === "ical" ? { "data-icalinfo": x.t.id } : { "data-edit": "task:" + x.t.id })}
        style={{ "--c": `var(${p.color(x.t)})`, top: `${(x.s / 60 - H0) * PX + 1}px`, height: `${Math.max((x.e - x.s) / 60 * PX - 2, 26)}px`, left: `calc(${x.col * 100 / ncol}% + 2px)`, width: `calc(${100 / ncol}% - 4px)` } as Css}>
        <span className="t">{hrs(x.t)}{x.t.canc ? <span className="canc-pill">{tr("Annulé")}</span> : null}</span><b>{x.t.title}</b>{x.t.loc ? <span className="loc">{x.t.loc}</span> : null}
      </button>)}
      {now}</div>
    {p.qOpen ? <form className="qform" id="qForm">
      <input id="qTitle" placeholder={tr("Que fais-tu ce jour-là ?")} aria-label={tr("Activité")} required autoComplete="off" />
      <div className="small muted" style={{ margin: "2px 0 -4px" }}>{tr("Heures (optionnel)")}</div><div className="two"><label>{tr("Heure de début")}<input id="qTime" type="time" /></label><label>{tr("Heure de fin")}<input id="qTimeEnd" type="time" /></label></div>
      <div className="two"><label>{tr("Type")}<input id="qCat" list="typeList" placeholder={tr("Ex. Sport")} autoComplete="off" /></label><label>{tr("Jusqu'au (optionnel)")}<input id="qEnd" type="date" min={k} /></label></div>
      <div className="two"><button type="button" className="btn ghost" id="qCancel">{tr("Annuler")}</button><button className="btn" type="submit">{tr("Ajouter")}</button></div>
    </form> : <button className="qbtn" id="qOpen">{tr("+ Ajouter une activité ce jour")}</button>}
  </>;
}
