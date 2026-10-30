// Musculation : carte « Mon programme » (#coachBox) et recherche d'exercices de la fiche du programme (pastilles choisies, résultats).
// Migré en v67 (ticket #3) ; même rendu que renderCoach / cfRender / cfSearch de site/app.js, clics et saisie gérés par app.js.
// La remarque (#coRemark) n'est pas contrôlée : React garde le champ, donc le texte en cours de saisie n'est jamais perdu.

export interface CI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface CoachVM { goal: string; ia: boolean; level: string; n: number; wait: boolean; remarks: { text: string; when: string }[] }

export function CoachCard({ c, more, i18n }: { c: CoachVM | null; more: string; i18n: CI18n }) {
  const { tr, L } = i18n;
  if (!c) return <div className="card coach-card"><div className="grow"><b>{tr(L("Ton programme sur mesure"))}</b><div className="small muted">{tr(L("Quelques questions (niveau, objectif, jours, matériel) et Sid'compagnon crée tes séances."))}</div></div>
    <button type="button" className="btn" data-coach="new">{tr(L("Créer mon programme"))}</button></div>;
  const nr = c.remarks.length;
  return <div className="card coach-card coach-on"><div className="coach-top"><div className="grow"><span className="eyebrow">{tr(L("Mon programme"))}</span>
    <b>{tr(L(c.goal))}{c.ia ? tr(` · ${L("ajusté par Claude")}`) : null}</b>
    <div className="small muted">{tr(`${c.level ? L(c.level) + " · " : ""}${c.n} ${L(c.n > 1 ? "séances" : "séance")}`)}</div></div>
    <button type="button" className="pen" data-coach="more" aria-label={tr(L("Plus d'actions"))} dangerouslySetInnerHTML={{ __html: more }}></button></div>
    {c.wait ? <div className="coach-wait" role="status"><span className="grow">{tr(L("Demande envoyée à Claude : le programme ajusté arrivera ici tout seul."))}</span>
      <button type="button" className="linkbtn" data-coach="resend">{tr(L("Renvoyer"))}</button><button type="button" className="x" data-coach="unwait" aria-label={tr(L("Masquer"))}>×</button></div> : null}
    <div className="coach-adj"><label htmlFor="coRemark" className="eyebrow">{tr(L("Ta remarque sur ce programme"))}</label>
      <textarea id="coRemark" className="autogrow" rows={2} maxLength={600} placeholder={tr(L("Ex. remplace la 2e séance jambes par une séance haut du corps"))}></textarea>
      <div className="coach-adj-b"><button type="button" className="btn" data-coach="adjust">{tr(L("Ajuster avec Claude"))}</button></div>
      {nr ? <details className="coach-rem"><summary className="small muted">{tr(`${nr} ${L(nr > 1 ? "remarques envoyées" : "remarque envoyée")}`)}</summary>
        <ul>{c.remarks.map((r, i) => <li key={i} className="small"><span className="notr">{r.text}</span>{" "}<span className="muted">{tr(`· ${r.when}`)}</span></li>)}</ul></details> : null}
    </div></div>;
}

export function CfSel({ names, i18n }: { names: string[]; i18n: CI18n }) {
  return <>{names.map((n) => <span key={n} className="pill on cf-chip"><span className="notr">{n}</span><button type="button" className="x" data-cfrm={n} aria-label={i18n.tr(i18n.L("Retirer"))}>×</button></span>)}</>;
}

export function CfRes({ q, hits, i18n }: { q: boolean; hits: { n: string; grp: string; p: boolean }[]; i18n: CI18n }) {
  const { tr, L } = i18n;
  if (!q) return null;
  if (!hits.length) return <div className="small muted">{tr(L("Aucun exercice trouvé"))}</div>;
  return <>{hits.map((e) => <button key={e.n} type="button" className="cf-hit" data-cfadd={e.n}><span className="notr">{e.n}</span><small>{tr(L(e.grp) + (e.p ? ` · ${L("prioritaire")}` : ""))}</small></button>)}</>;
}
