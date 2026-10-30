// Lecteur-annoteur de PDF (sid'note), migré en v65 (ticket #3) : calque d'annotations d'une page (traits, surlignages, zones de texte)
// et réglages du stylo / surligneur (couleurs, épaisseur). Même rendu que pvOverlay / pvOpts de site/app.js.
// Les pages pdf.js (canvas), le dessin en cours, la gomme, le déplacement des zones et la saisie restent gérés par app.js.
// Les zones de texte ne sont pas contrôlées (defaultValue) : app.js enregistre la saisie ; React garde la zone qui a le focus.

export interface PI18n { tr: (fr: string) => string; L: (fr: string) => string }
export type PvAnn =
  | { id: string; t: "ink"; cls: string; d: string; stroke: string; sw: string }
  | { id: string; t: "hl"; style: React.CSSProperties }
  | { id: string; t: "text"; on: boolean; style: React.CSSProperties; txt: string };

export function PvOverlay({ anns, viewBox, grip, i18n }: { anns: PvAnn[]; viewBox: string; grip: string; i18n: PI18n }) {
  const { tr, L } = i18n;
  return <>
    <svg className="pv-ink" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox={viewBox}>
      {anns.map((a) => a.t === "ink" ? <path key={a.id} data-ann={a.id} className={a.cls} d={a.d} stroke={a.stroke} strokeWidth={a.sw} /> : null)}
    </svg>
    {anns.map((a) => a.t === "hl"
      ? <button key={a.id} type="button" className="pv-hl" data-ann={a.id} style={a.style} aria-label={tr(L("Surlignage"))}></button>
      : a.t === "text"
        ? <div key={a.id} className={`pv-txt${a.on ? " pv-on" : ""}`} data-ann={a.id} style={a.style}>
          <textarea rows={1} className="notr" aria-label={tr(L("Texte sur le PDF"))} placeholder={tr(L("Écris ici…"))} defaultValue={a.txt}></textarea>
          <button type="button" className="pv-txt-x" data-pvdel={a.id} aria-label={tr(L("Supprimer ce texte"))}>×</button>
          <span className="pv-txt-mv" data-pvmv={a.id} title={tr(L("Déplacer"))} aria-hidden="true" dangerouslySetInnerHTML={{ __html: grip }}></span>
          <span className="pv-txt-rs" data-pvrs={a.id} title={tr(L("Agrandir ou rétrécir"))} aria-hidden="true"></span>
        </div>
        : null)}
  </>;
}

export function PvOpts({ cols, cur, size, dot, i18n }: { cols: string[]; cur: string; size: number; dot: React.CSSProperties; i18n: PI18n }) {
  const { tr, L } = i18n;
  return <>
    <div className="pv-sw" role="group" aria-label={tr(L("Couleur"))}>{cols.map((c) => <button key={c} type="button" data-pvc={c} style={{ "--sw": c } as React.CSSProperties} aria-pressed={cur === c} aria-label={tr(`${L("Couleur")} ${c}`)}></button>)}</div>
    <label className="pv-size"><span>{tr(L("Épaisseur"))}</span><input type="range" id="pvSize" min="1" max="10" step="1" defaultValue={String(size)} aria-label={tr(L("Épaisseur"))} /><i className="pv-dot" style={dot}></i></label>
  </>;
}

// v65 : éditeur de notes : menus déroulants de la barre de mise en forme (#rtPop) et vignettes des photos (#notePhotos).
// Le texte de la note (contenteditable) reste géré par app.js : React ne peut pas posséder un contenu modifié directement par le navigateur.
export function RtMenu({ items, i18n }: { items: { c: string; l: string; sw: boolean }[]; i18n: PI18n }) {
  const { tr, L } = i18n;
  return <>{items.map((x) => <button key={x.c} type="button" role="menuitem" data-rtc={x.c} data-sw={x.sw ? x.c : undefined}>{x.sw ? <i className="rt-sw"></i> : null}{tr(L(x.l))}</button>)}</>;
}

// u : undefined = en chargement, null = indisponible, sinon l'image (data:)
export function NotePhotos({ photos, i18n }: { photos: { id: string; u?: string | null }[]; i18n: PI18n }) {
  const { tr, L } = i18n;
  return <>{photos.map((p) => <button key={p.id} type="button" className="np" data-np={p.id} aria-label={tr(L("Voir la photo"))}>
    {p.u === undefined ? <span className="np-load"></span> : p.u ? <img src={p.u} alt="" /> : <span className="small muted">{tr(L("Indisponible"))}</span>}</button>)}</>;
}
