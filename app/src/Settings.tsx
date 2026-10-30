// Coquille → Réglages et petites fenêtres, migrés en v62 (ticket #3) : statistiques, onglets affichés, types d'activités,
// adresses du connecteur Claude, ajout rapide (+), fiche « comment faire » d'un exercice.
// Même rendu que renderStats / renderTabsCard / renderTypes / mcpLoad / openQuickAdd / exHelpOpen de site/app.js ;
// les clics, cases à cocher et formulaires restent gérés par app.js.

export interface SI18n { tr: (fr: string) => string; L: (fr: string) => string }
const Ic = ({ cls, html }: { cls: string; html: string }) => <span className={cls} dangerouslySetInnerHTML={{ __html: html }}></span>;

export function Stats({ rows, i18n }: { rows: [string, string | number][]; i18n: SI18n }) {
  return <>{rows.map(([a, b]) => <div key={a} className="row"><div className="grow">{i18n.tr(a)}</div><b style={{ fontVariantNumeric: "tabular-nums" }}>{i18n.tr(String(b))}</b></div>)}</>;
}

export interface TabGroup { k: string; icon: string; label: string; tabs: { k: string; label: string; on: boolean; fixed?: boolean }[] }
export function TabsCard({ groups, i18n }: { groups: TabGroup[]; i18n: SI18n }) {
  const { tr, L } = i18n;
  return <>{groups.map((g) => [
    <div key={"h" + g.k} className="tabgrp" dangerouslySetInnerHTML={{ __html: g.icon + escHtml(tr(L(g.label))) }}></div>,
    <div key={"c" + g.k} className="card">{g.tabs.map((t) => t.fixed
      ? <div key={t.k} className="row"><span className="grow">{tr(L("Réglages"))}</span><span className="small muted">{tr(L("toujours affiché"))}</span></div>
      : <label key={t.k} className="row" style={{ cursor: "pointer" }}><span className="grow">{tr(L(t.label))}</span><input type="checkbox" className="switch" data-tabpref={t.k} defaultChecked={t.on} /></label>)}</div>,
  ])}</>;
}
const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function TypesCard({ types, i18n }: { types: { name: string; c: string; n: number }[]; i18n: SI18n }) {
  const { tr } = i18n;
  return <>
    {types.map((t, i) => <div key={i + t.name} className="row">
      <button className="swatch" data-tcol={i} style={{ background: `var(${t.c})` }} aria-label={tr(`Changer la couleur de ${t.name}`)}></button>
      <div className="grow">{tr(t.name + " ")}<span className="small muted">{tr(`· ${t.n}`)}</span></div>
      <button className="x" data-tydel={i} aria-label={tr(`Supprimer ${t.name}`)}>×</button></div>)}
    <form className="row" id="typeForm"><input id="typeIn" placeholder={tr("Nouveau type, ex. Examen")} aria-label={tr("Nouveau type")} autoComplete="off" /><button className="btn" type="submit">{tr("Ajouter")}</button></form>
  </>;
}

export function McpList({ rows, i18n }: { rows: { hash: string; created: string; used: string }[]; i18n: SI18n }) {
  const { tr, L } = i18n;
  return <>{rows.map((r) => <div key={r.hash} className="row mcp-it"><div className="grow"><b>{tr(`${L("Adresse du")} ${r.created}`)}</b>
    <span className="small muted">{tr(r.used ? `${L("Utilisée le")} ${r.used}` : L("Pas encore utilisée"))}</span></div>
    <button type="button" className="mini" data-mcpdel={r.hash}>{tr(L("Retirer"))}</button></div>)}</>;
}

const CHEVR = <svg className="chev-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
export function QuickAdd({ acts, i18n }: { acts: { k: string; t: string; s: string; icon: string }[]; i18n: SI18n }) {
  const { tr, L } = i18n;
  return <>{acts.map((a) => <button key={a.k} type="button" className="qa-it" data-qa={a.k}><Ic cls="sp-ic" html={a.icon} />
    <span className="grow"><b>{tr(L(a.t))}</b><span className="small muted">{tr(L(a.s))}</span></span>{CHEVR}</button>)}</>;
}

export interface ExHelpVM { name: string; img: string | null; mus: string; steps: string[]; err: string }
export function ExHelp({ h, i18n }: { h: ExHelpVM; i18n: SI18n }) {
  const { tr, L } = i18n;
  return <>
    {h.img ? <div className="exh-pics">{[0, 1].map((i) => <figure key={i}><img src={`exercices/${encodeURIComponent(h.img!)}-${i}.jpg`} alt={tr(`${h.name} : ${L(i ? "arrivée" : "départ")}`)} loading="lazy" decoding="async" width="480" height="320" /><figcaption>{tr(L(i ? "Arrivée" : "Départ"))}</figcaption></figure>)}</div> : null}
    <p className="exh-lbl">{tr(L("Muscles travaillés"))}</p><p className="notr">{h.mus}</p>
    <p className="exh-lbl">{tr(L("Comment faire"))}</p><ol className="exh-steps notr">{h.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
    <p className="exh-lbl">{tr(L("À éviter"))}</p><p className="exh-err notr">{h.err}</p>
    {h.img ? <p className="small muted exh-src">{tr(L("Photos : Free Exercise DB (domaine public)"))}</p> : null}
  </>;
}
