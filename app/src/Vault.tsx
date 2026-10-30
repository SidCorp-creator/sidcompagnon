// sid'note → Documents (classeurs, liste) et Mots de passe (liste), migrés en v57 (ticket #3).
// Affichage seulement : le chiffrement, les clés, le déverrouillage et l'envoi des fichiers restent dans app.js, inchangés.
// Mots de passe : le mot de passe et la note d'une entrée n'arrivent ici que si la personne a touché « Afficher » (show),
// comme dans l'ancien rendu ; au verrouillage, app.js vide la liste.

export interface VI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface DocFolderVM { id: string; name: string; count: number }
export interface DocVM { id: string; title: string; folder: string; meta: string; status: string }
export interface PwVM { id: string; site: string; user: string; show: boolean; pw?: string; note?: string }

const GRIP = <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><circle cx="4" cy="4" r="1.6" /><circle cx="10" cy="4" r="1.6" /><circle cx="4" cy="9" r="1.6" /><circle cx="10" cy="9" r="1.6" /><circle cx="4" cy="14" r="1.6" /><circle cx="10" cy="14" r="1.6" /></svg>;
const PEN = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>;
const SHARE = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>;
const EYE = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
const COPY = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="12" height="12" rx="2.5" /><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" /></svg>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function DocFolders({ folders, cur, icon, i18n }: { folders: DocFolderVM[]; cur: string; icon: string; i18n: VI18n }) {
  const { tr, L } = i18n;
  return <>
    <button className="pill" data-dfold="all" aria-pressed={!cur}>{tr(L("Tous"))}</button>
    {folders.map((f) => <button key={f.id} className="pill" data-dfold={f.id} aria-pressed={cur === f.id} dangerouslySetInnerHTML={{ __html: `${icon} ${esc(tr(f.name + " "))}<span class="cnt">${f.count || ""}</span>` }}></button>)}
    <button className="pill add" data-dfoldnew="1">{tr(`+ ${L("Classeur")}`)}</button>
  </>;
}

export function DocList({ docs, grip, empty, icon, i18n }: { docs: DocVM[]; grip: boolean; empty: string; icon: string; i18n: VI18n }) {
  const { tr, L } = i18n;
  if (!docs.length) return <div className="empty">{tr(empty)}</div>;
  return <>{docs.map((d) => <div key={d.id} className="doc" data-doc={d.id}>
    {grip ? <button className="grip" data-dgrip={d.id} aria-label={tr(L("Glisser vers un classeur"))} title={tr(L("Glisser vers un classeur"))}>{GRIP}</button> : null}
    <button className="doc-ic" data-docopen={d.id} aria-label={tr("Ouvrir")}>PDF</button>
    <button className="doc-open" data-docopen={d.id}><b>{tr(d.title)}</b><span className="small muted" dangerouslySetInnerHTML={{ __html: metaHtml(d, icon, tr) }}></span></button>
    <button className="pen" data-docshare={d.id} aria-label={tr("Partager ou enregistrer")}>{SHARE}</button>
    <button className="pen" data-edit={"doc:" + d.id} aria-label={tr("Modifier")}>{PEN}</button></div>)}</>;
}
// ligne d'infos : [classeur] · pages · taille · date [· état de l'envoi], mêmes nœuds de texte que l'ancien rendu
function metaHtml(d: DocVM, icon: string, tr: (s: string) => string) {
  const txt = (d.folder ? " · " : "") + d.meta + (d.status ? " · " : "");
  return (d.folder ? `${icon} <span class="notr">${esc(d.folder)}</span>` : "") + esc(tr(txt)) + (d.status ? `<span style="color:var(--warn)">${esc(tr(d.status))}</span>` : "");
}

export function PwList({ items, empty, i18n }: { items: PwVM[]; empty: string; i18n: VI18n }) {
  const { tr, L } = i18n;
  if (!items.length) return <div className="empty">{tr(L(empty))}</div>;
  return <>{items.map((x) => <div key={x.id} className="pw-row"><div className="pw-av notr">{String(x.site).trim()[0] || "?"}</div>
    <div className="pw-main notr"><b>{x.site}</b>{x.user ? <span className="small muted">{x.user}</span> : null}<span className="pw-sec">{x.show ? x.pw : "••••••••"}</span>{x.note && x.show ? <span className="small muted">{x.note}</span> : null}</div>
    <button className="pen" data-pweye={x.id} aria-label={tr(L(x.show ? "Masquer" : "Afficher"))}>{EYE}</button>
    <button className="pen" data-pwcopy={x.id} aria-label={tr("Copier le mot de passe")}>{COPY}</button>
    <button className="pen" data-pwedit={x.id} aria-label={tr("Modifier")}>{PEN}</button></div>)}</>;
}
