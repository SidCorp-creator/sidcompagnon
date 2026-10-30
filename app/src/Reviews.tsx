// Graphiques : commentaires du jour et de la semaine, historique des semaines (ticket #3, v52).
// Même rendu que revHtml / renderReviews de site/app.js. Pendant le calcul, l'app pose son animation de chargement
// (nuLoading) dans <div id="revLoad-…"> : React laisse ce contenu tranquille.
import type { I18n } from "./types";
import { fmtWhen } from "./format";
import { parse } from "./dates";

export interface Rev { summary: string; good?: string[]; improve?: string[]; tips?: string[]; at: string }
export interface PastRev extends Rev { id: string } // id = lundi de la semaine (AAAA-MM-JJ)
type P = { i18n: I18n };

function RevBody({ r, i18n }: P & { r: Rev }) {
  const { L, MO } = i18n;
  const li = (a?: string[]) => a && a.length ? <ul>{a.map((x, i) => <li key={i} className="notr">{x}</li>)}</ul> : null;
  return <>
    <p className="notr">{r.summary}</p>
    {r.good && r.good.length ? <><div className="lab">✓ {L("Bien joué")}</div>{li(r.good)}</> : null}
    {r.improve && r.improve.length ? <><div className="lab">↓ {L("À améliorer")}</div>{li(r.improve)}</> : null}
    {r.tips && r.tips.length ? <><div className="lab">→ {L("Pistes")}</div>{li(r.tips)}</> : null}
    <span className="small muted">{L("Mis à jour")} {fmtWhen(Date.parse(r.at), MO)}</span>
  </>;
}

export function RevCard({ r, scope, busy, i18n }: P & { r: Rev | null; scope: "day" | "week"; busy: boolean }) {
  const { L } = i18n, head = scope === "day" ? L("Commentaire du jour") : L("Commentaire de la semaine");
  if (busy) return <><h3>{head}</h3><div id={`revLoad-${scope}`}></div></>;
  if (!r) return <>
    <h3>{head}</h3>
    <p className="muted">{L(scope === "day" ? "Un résumé de ta journée : macros, poids et calories." : "Ce que tu as bien fait cette semaine, ce qui reste à améliorer, et des pistes concrètes.")}</p>
    <button type="button" className="btn" data-rev={scope}>{L("Générer")}</button>
  </>;
  return <>
    <h3>{head}<button type="button" className="mini" data-rev={scope}>↻ {L("Actualiser")}</button></h3>
    <RevBody r={r} i18n={i18n} />
  </>;
}

export function WeeksHistory({ weeks, i18n }: P & { weeks: PastRev[] }) {
  const { L, MO } = i18n;
  if (!weeks.length) return <div className="card"><div className="empty">{L("Génère le commentaire de la semaine : chaque semaine sera gardée ici pour suivre tes progrès.")}</div></div>;
  return <>{weeks.map((w) => {
    const m = parse(w.id), s = new Date(m);
    s.setDate(s.getDate() + 6);
    return <details key={w.id} className="setsec gr-wk">
      <summary><span>{L("Semaine du")} {m.getDate()} {MO[m.getMonth()]} {L("au")} {s.getDate()} {MO[s.getMonth()]}</span>
        <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></summary>
      <div className="setsec-in gr-rev" style={{ paddingTop: 0 }}><RevBody r={w} i18n={i18n} /></div>
    </details>;
  })}</>;
}
