// Petits éléments migrés en v69 (ticket #3) : message du bas (#toast, avec ou sans bouton), titre du mois de l'Agenda,
// aperçu « Compris : … » de l'ajout rapide (#fHint), aide au recalcul des calories (#nuEHint), lecteur Spotify (#spotEmbed),
// état de l'installation (#appStatus). Même rendu que site/app.js.

export interface MI18n { tr: (fr: string) => string; L: (fr: string) => string }

export function Toast({ m, label, onAct, i18n }: { m: string; label: string; onAct: (() => void) | null; i18n: MI18n }) {
  const { tr, L } = i18n;
  if (!label) return <>{tr(m)}</>;
  return <><span>{tr(L(m))}</span><button type="button" className="toast-act" onClick={() => onAct && onAct()}>{tr(L(label))}</button></>;
}

export function CalTitle({ mo, y, i18n }: { mo: string; y: number; i18n: MI18n }) {
  return <>{`${mo} ${y} `}<span className="yr-ic">{i18n.tr(`▦ ${i18n.L("Année")}`)}</span></>;
}

export function QuickHint({ icon, title, when, i18n }: { icon: string; title: string; when: string; i18n: MI18n }) {
  const { tr, L } = i18n;
  // icon = contenu de l'icône (ICS.calendar de app.js), dessinée comme IC("calendar")
  return <>{icon ? <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }}></svg> : null}<span>{tr(`${L("Compris")} : `)}<b className="notr">{title}</b>{` · ${when}`}</span></>;
}

export function NuEHint({ st, i18n }: { st: "ok" | "none" | "busy"; i18n: MI18n }) {
  const { tr, L } = i18n;
  if (st === "ok") return <>{tr(`✓ ${L("Calories recalculées selon la quantité")}`)}</>;
  return <>{tr(L("Quantité sans chiffre : je ne peux pas recalculer seul."))}<button type="button" className="mini" id="nuERecalc">{st === "busy" ? <span className="spin"></span> : tr(`↻ ${L("Recalculer")}`)}</button></>;
}

export function SpotEmbed({ ok, src, i18n }: { ok: boolean; src: string; i18n: MI18n }) {
  const { tr, L } = i18n;
  if (!ok) return <div className="spot-gate"><p className="small">{tr(L("Le lecteur est fourni par Spotify. En le chargeant, Spotify reçoit ton adresse IP et peut déposer ses propres cookies sur cet appareil."))}{" "}
    <button type="button" className="linkbtn" data-openlegal="cookies">{tr(L("En savoir plus"))}</button></p><button type="button" className="btn" data-spotok="1">{tr(L("Charger le lecteur Spotify"))}</button></div>;
  return <><div className="small spot-off"><button type="button" className="linkbtn" data-spotno="1">{tr(L("Ne plus charger Spotify sur cet appareil"))}</button></div>
    <iframe key={src} title={tr("Lecteur Spotify")} src={src} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></>;
}

export function AppStatus({ ok, i18n }: { ok: boolean; i18n: MI18n }) {
  const { tr } = i18n;
  return ok ? <><span className="syncdot"></span><span>{tr("Tu utilises déjà Sid'note comme application.")}</span></>
    : <><span className="syncdot wait"></span><span>{tr("Tu es dans le navigateur. Suis les étapes ci-dessous pour installer l'app.")}</span></>;
}
