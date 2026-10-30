// sid'fit → Nutrition : copie d'un repas sur d'autres jours (fenêtre) et résumé du profil (besoins, objectif de poids). Migré en v59 (ticket #3).
// Même rendu que renderNuCopy / renderNuPlan / nuGoalHtml de site/app.js ; les clics restent gérés par app.js.
import type { CSSProperties } from "react";
import { monthCells } from "./dates";
import type { NuI18n } from "./Nutrition";

type Css = CSSProperties & Record<string, string | number>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface NuCopyVM { y: number; m: number; sel: string[]; src: string; today: string; max: string; nextOff: boolean; dow: string[] }
export function NuCopy({ c, MOL, i18n }: { c: NuCopyVM; MOL: string[]; i18n: NuI18n }) {
  const { tr, L } = i18n, n = c.sel.length;
  return <>
    <p className="small muted" style={{ margin: "0 0 8px" }}>{tr(L("Touche les jours où tu as mangé (ou mangeras) la même chose."))}</p>
    <div className="cal-head"><button type="button" className="cal-nav" data-nucpn="-1" aria-label={tr(L("Mois précédent"))}>‹</button><b>{tr(`${MOL[c.m]} ${c.y}`)}</b><button type="button" className="cal-nav" data-nucpn="1" aria-label={tr(L("Mois suivant"))} disabled={c.nextOff}>›</button></div>
    <div className="cal-grid cal-dow">{c.dow.map((d, i) => <span key={i}>{tr(d)}</span>)}</div>
    <div className="cal-grid nu-cpgrid">{monthCells(c.y, c.m).map((x, i) => {
      if (!x) return <span key={"o" + i} className="day out"></span>;
      const on = c.sel.includes(x.k);
      return <button key={x.k} type="button" className={`day ${x.k === c.today ? "today" : ""} ${on ? "sel" : ""} ${x.k === c.src ? "nu-cp-src" : ""}`} data-nucpd={x.k} aria-pressed={on} disabled={x.k > c.max || x.k === c.src} aria-label={tr(`${x.d} ${MOL[c.m]}`)}><span className="num">{x.d}</span></button>;
    })}</div>
    <button type="button" className="btn" id="nuCopyGo" disabled={!n} style={{ width: "100%", marginTop: "12px" }}>{tr(n ? `${L("Copier sur")} ${n} ${L(n > 1 ? "jours" : "jour")}` : L("Choisis au moins un jour"))}</button>
  </>;
}

/** Objectif de poids : la même carte sert en haut de la journée (avec bouton) et dans le résumé du profil (sans). */
export interface GoalVM { ok: boolean; head: string; pace: string; real: string; advice: string; path: string; button: boolean }
export function GoalBody({ g, alert, i18n }: { g: GoalVM; alert: string; i18n: NuI18n }) {
  const { tr, L } = i18n;
  return <>
    <b dangerouslySetInnerHTML={{ __html: `${g.ok ? "✓ " : alert + " "}${esc(tr(g.head))}` }}></b>
    {g.pace ? <span className="small">{tr(g.pace)}</span> : null}
    {g.real ? <span className="small">{tr(g.real)}</span> : null}
    {g.advice ? <span className="small muted notr">{g.advice}</span> : null}
    {g.path ? <span className="small"><b>{tr(`${L("Chemin conseillé")} :`)}</b>{tr(g.path)}</span> : null}
    {g.button ? (g.ok ? <button type="button" className="mini" data-nugoalok="1" style={{ justifySelf: "start", marginTop: "4px" }}>{tr(L("OK, compris"))}</button>
      : <button type="button" className="mini" data-nugoaledit="1" style={{ justifySelf: "start", marginTop: "4px" }}>{tr(L("Changer mon objectif"))}</button>) : null}
  </>;
}

export interface PlanVM { bmr: number; tdee: number; kcal: number; p: number; c: number; f: number; text: string; warn: string[]; goal: GoalVM | null }
function Boxes({ items, i18n }: { items: [string | number, string, string?][]; i18n: NuI18n }) {
  return <div className={`nu-plan ${items.length === 4 ? "four" : ""}`}>{items.map(([v, l, c], i) => <div key={i}><b>{i18n.tr(String(v))}</b><span>{c ? <span className="mdot" style={{ "--c": `var(${c})` } as Css}></span> : null}{i18n.tr(i18n.L(l))}</span></div>)}</div>;
}
export function NuPlan({ pl, alert, i18n }: { pl: PlanVM; alert: string; i18n: NuI18n }) {
  return <>
    <Boxes i18n={i18n} items={[[pl.bmr, "Métabolisme de base"], [pl.tdee, "Dépense du jour"], [pl.kcal, "Objectif (kcal)"]]} />
    <Boxes i18n={i18n} items={[[pl.p + " g", "Protéines", "--m-p"], [pl.c + " g", "Glucides", "--m-c"], [pl.f + " g", "Lipides", "--m-f"]]} />
    {pl.goal ? <div className={`card nu-goalcard ${pl.goal.ok ? "ok" : ""}`} style={{ background: "var(--bg)" }}><GoalBody g={{ ...pl.goal, button: false }} alert={alert} i18n={i18n} /></div> : null}
    <p className="small notr" style={{ margin: "0 4px" }}>{pl.text}</p>{pl.warn.map((w, i) => <div key={i} className="nu-warn notr">{w}</div>)}
  </>;
}
