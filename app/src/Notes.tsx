// sid'note → Notes : chemin du dossier, dossiers en tuiles, notes en lignes. Migré en v57 (ticket #3).
// Même rendu que renderNotes de site/app.js (mêmes classes et data-*) : clics, glisser-déposer, déverrouillage des notes secrètes
// et l'éditeur (contenteditable) restent dans app.js. Les notes secrètes arrivent déjà déchiffrées ou marquées « locked » :
// ce composant ne voit jamais de clé ni de texte chiffré.

export interface NfVM { id: string; name: string; count: number }
export interface NoteVM {
  id: string;
  locked: boolean; // note secrète verrouillée : ni titre ni texte
  secret: boolean;
  title: string;
  prev: string;
  path: string; // dossier (pendant une recherche)
  photos: number;
  pdf: { pages: number; anns: number } | null;
  when: string;
}
export interface NotesI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface Icons { folder: string; lock: string; camera: string }

const GRIP = <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><circle cx="4" cy="4" r="1.6" /><circle cx="10" cy="4" r="1.6" /><circle cx="4" cy="9" r="1.6" /><circle cx="10" cy="9" r="1.6" /><circle cx="4" cy="14" r="1.6" /><circle cx="10" cy="14" r="1.6" /></svg>;
const MORE = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="19" cy="12" r="1.9" /></svg>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function NotesPath({ path, i18n }: { path: NfVM[]; i18n: NotesI18n }) {
  const { tr, L } = i18n;
  if (!path.length) return null;
  const up = path.length > 1 ? path[path.length - 2] : null;
  return <>
    <button type="button" className="back nf-back" data-nfgo={up ? up.id : ""}>{tr(`‹ ${up ? up.name : L("Notes")}`)}</button>
    <div className="nf-crumbs"><button type="button" className="nf-crumb" data-nfgo="">{tr(L("Notes"))}</button>
      {path.map((f, i) => [<span key={"s" + f.id} aria-hidden="true">›</span>, i === path.length - 1 ? <b key={f.id} className="notr">{f.name}</b> : <button key={f.id} type="button" className="nf-crumb notr" data-nfgo={f.id}>{f.name}</button>])}</div>
  </>;
}

export function NoteList({ dirs, inDir, notes, search, empty, icons, i18n }: { dirs: NfVM[]; inDir: boolean; notes: NoteVM[]; search: boolean; empty: string; icons: Icons; i18n: NotesI18n }) {
  const { tr, L } = i18n;
  const more = (id: string) => <button type="button" className="pen note-more" data-nmore={id} aria-label={tr(L("Plus d'actions"))}>{MORE}</button>;
  return <>
    {dirs.length ? <><h2 className="nl-h">{tr(L(inDir ? "Sous-dossiers" : "Dossiers"))}</h2>
      <div className="nf-grid">{dirs.map((f) => <div key={f.id} className="nf-row nf-tile"><span className="ngrip" data-fgrip={f.id} aria-hidden="true" title={tr(L("Maintenir et glisser"))}>{GRIP}</span>
        <button type="button" className="nf-open" data-nfopen={f.id}><span className="nf-ic" dangerouslySetInnerHTML={{ __html: icons.folder }}></span><b className="grow notr">{f.name}</b><span className="nf-n">{f.count || "0"}</span></button>
        <button type="button" className="pen" data-nfmore={f.id} aria-label={tr(L("Plus d'actions"))}>{MORE}</button></div>)}</div></> : null}
    {notes.length && dirs.length ? <h2 className="nl-h">{tr(L("Notes"))}</h2> : null}
    {notes.length ? <div className="nl-notes">{notes.map((x) => {
      const when = <span className="when">{x.when}</span>;
      if (x.locked) return <div key={x.id} className="note-row"><button className="note note-lock" data-note={x.id}><b dangerouslySetInnerHTML={{ __html: `${icons.lock} ${esc(tr(L("Note secrète")))}` }}></b><span className="prev">{tr(L("Touche pour l'ouvrir avec ton code"))}</span>{when}</button>{more(x.id)}</div>;
      return <div key={x.id} className="note-row"><span className="ngrip" data-ngrip={x.id} aria-hidden="true" title={tr(L("Maintenir et glisser"))}>{GRIP}</span>
        <button className="note" data-note={x.id}>
          {x.secret ? <b className="notr" dangerouslySetInnerHTML={{ __html: `${icons.lock} ${esc(x.title)}` }}></b> : <b className="notr">{x.title}</b>}
          {search && x.path ? <span className="small muted nf-in" dangerouslySetInnerHTML={{ __html: `${icons.folder} ${esc(x.path)}` }}></span> : null}
          <span className="prev notr">{x.prev}</span>
          {x.photos ? <span className="np-count" dangerouslySetInnerHTML={{ __html: `${icons.camera} ${esc(tr(`${x.photos} ${L(x.photos > 1 ? "photos" : "photo")}`))}` }}></span> : null}
          {x.pdf ? <span className="np-count pdf-badge">{tr(`PDF${x.pdf.pages ? ` · ${x.pdf.pages} ${L(x.pdf.pages > 1 ? "pages" : "page")}` : ""}${x.pdf.anns ? ` · ${x.pdf.anns} ${L(x.pdf.anns > 1 ? "annotations" : "annotation")}` : ""}`)}</span> : null}
          {when}</button>{more(x.id)}</div>;
    })}</div> : dirs.length ? null : <div className="empty">{tr(L(empty))}</div>}
  </>;
}
