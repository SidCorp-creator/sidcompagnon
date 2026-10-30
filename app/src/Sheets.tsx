// Fenêtres et petites cartes migrées en v66 (ticket #3) : état de la synchronisation (Réglages, accueil), fenêtre d'actions « ⋯ »,
// calendriers reliés (liste + pastilles), aperçu d'une sauvegarde, textes légaux.
// Même rendu que setSync / openActions / renderCals / restoreIn / openLegal de site/app.js ; clics et formulaires restent dans app.js.

export interface WI18n { tr: (fr: string) => string; L: (fr: string) => string }
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// état : "trial" | "bad" | "off" (hors connexion) | "wait" | "ok"
export function SyncState({ st, i18n }: { st: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  if (st === "trial") return <><span className="syncdot wait"></span>{tr(L("Mode essai : tes données restent sur cet appareil"))}</>;
  if (st === "bad") return <><span className="syncdot err"></span>{tr(`${L("Synchronisation en échec")} · `)}<button type="button" className="linkbtn" data-syncretry="1">{tr(L("Réessayer"))}</button></>;
  const wait = st === "wait" || st === "off";
  return <><span className={`syncdot ${wait ? "wait" : ""}`}></span>{tr(L(st === "off" ? "Hors connexion · tes modifications seront envoyées plus tard" : st === "wait" ? "Synchronisation…" : "Synchronisé"))}</>;
}

export function HomeSync({ msg, i18n }: { msg: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  return <><span className="grow"><b>{tr(L("Pas encore enregistré en ligne"))}</b><span className="small">{tr(L("Tes dernières modifications sont gardées sur cet appareil, mais le serveur les a refusées. Nouvel essai automatique."))}
    {msg ? <>{" "}<span className="muted notr">{`(${msg})`}</span></> : null}</span></span>
    <button type="button" className="mini" data-syncretry="1">{tr(L("Réessayer"))}</button></>;
}

export function ActList({ items, check, i18n }: { items: { l: string; danger?: boolean; on?: boolean }[]; check: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  return <>{items.map((it, i) => <button key={i} type="button" className={`act-it ${it.danger ? "danger" : ""}`} data-act={i} aria-pressed={it.on ? "true" : undefined}
    dangerouslySetInnerHTML={{ __html: esc(tr(L(it.l))) + (it.on ? check : "") }}></button>)}</>;
}

export interface CalVM { id: string; name: string; c: string; on: boolean; n: number | null; err: string; priv: boolean }
export function CalList({ cals, more, i18n }: { cals: CalVM[]; more: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  if (!cals.length) return <div className="small muted">{tr(L("Aucun calendrier relié."))}</div>;
  return <>{cals.map((c) => <div key={c.id} className={`cal-row${c.on ? "" : " off"}`}>
    <button type="button" className="cal-dot" data-calcolor={c.id} style={{ "--c": `var(${c.c})` } as React.CSSProperties} aria-label={tr(L("Changer la couleur"))}></button>
    <div className="grow cal-main"><b className="notr">{c.name}</b><span className={`small ${c.err ? "cal-err" : "muted"}`}><span>{c.err ? c.err : c.n === null ? tr(L("Pas encore mis à jour.")) : tr(`${c.n} ${L(c.n > 1 ? "événements" : "événement")}`)}</span>
      {c.priv ? <>{" · "}<span>{tr(L("privé"))}</span></> : null}</span></div>
    <input type="checkbox" className="switch" data-calon={c.id} defaultChecked={c.on} title={tr(L("Afficher"))} aria-label={tr(`${L("Afficher")} ${c.name}`)} />
    <button type="button" className="pen" data-calmore={c.id} aria-label={tr(L("Plus d'actions"))} dangerouslySetInnerHTML={{ __html: more }}></button></div>)}</>;
}

export function CalLegend({ cals }: { cals: CalVM[] }) {
  return <>{cals.map((c) => <button key={c.id} type="button" className="pill cal-pill" data-calon2={c.id} aria-pressed={c.on}>
    <span className="dot" style={{ background: `var(${c.c})` }}></span><span className="notr">{c.name}</span></button>)}</>;
}

export function BkList({ rows, i18n }: { rows: { lb: string; n: number; now: number }[]; i18n: WI18n }) {
  const { tr, L } = i18n;
  return <><div className="row small muted"><span className="grow"></span><span className="n">{tr(L("Fichier"))}</span><span className="now">{tr(L("Maintenant"))}</span></div>
    {rows.map((r) => <div key={r.lb} className="row"><span className="grow">{tr(L(r.lb))}</span><span className="n">{r.n}</span><span className="now muted">{r.now}</span></div>)}</>;
}

export function LegalBody({ parts, page, i18n }: { parts: [string, string][]; page: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  return <>{parts.map(([h, t], i) => [<h3 key={"h" + i}>{tr(L(h))}</h3>, <p key={"p" + i}>{tr(L(t))}</p>])}
    <p><a href={page} target="_blank" rel="noopener">{tr(`${L("Lire la version complète")} ↗`)}</a></p><p className="small muted">{tr(L("Mis à jour le 22 octobre 2026."))}</p></>;
}

// v66 : état de Claude (Réglages > Claude), carte Claude de la Nutrition, pastilles de types sous les champs « Type »
export function AiState({ ok, i18n }: { ok: boolean; i18n: WI18n }) {
  return <><span className="ai-dot"></span><b>{i18n.tr(i18n.L(ok ? "Claude est branché" : "Claude n'est pas branché"))}</b></>;
}

export function NuAiCard({ ok, icon, href, name, i18n }: { ok: boolean; icon: string; href: string; name: string; i18n: WI18n }) {
  const { tr, L } = i18n;
  if (ok) return <><div className="grow"><b dangerouslySetInnerHTML={{ __html: `${icon} ${esc(tr(L("Claude calcule pour toi")))}` }}></b><div className="small muted">{tr(L("Dis-lui ce que tu as mangé ou envoie-lui la photo de ton assiette : tout arrive ici."))}</div></div>
    <a className="btn" href={href} target="_blank" rel="noopener">{tr(`${L("Ouvrir")} ${name}`)}</a></>;
  return <><div className="grow"><b>{tr(L("Branche Claude"))}</b><div className="small muted">{tr(L("Calories, menus et bilans sont calculés par Claude, même avec la version gratuite. 2 minutes, une seule fois."))}</div></div>
    <button type="button" className="btn" data-aiwiz="1">{tr(L("Brancher"))}</button></>;
}

export function TypeChips({ types, cur, i18n }: { types: { name: string; c: string }[]; cur: string; i18n: WI18n }) {
  const norm = (x: string) => String(x || "").trim().toLowerCase();
  return <>{types.map((t) => <button key={t.name} type="button" className="pill" data-tchip={t.name} aria-pressed={norm(t.name) === cur}>
    <span className="dot" style={{ background: `var(${t.c})` }}></span>{i18n.tr(t.name)}</button>)}</>;
}
