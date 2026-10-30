// Petits blocs de formulaires migrés en v64 (ticket #3) : atouts de l'écran de connexion, barre des notes secrètes, barre du classeur ouvert,
// profil Nutrition (sports), réglages du menu (repas, calories par repas, total), calories du jour.
// Même rendu que site/app.js ; les champs ne sont pas contrôlés (defaultValue) et app.js garde la saisie, les clics et l'enregistrement.
// Les champs d'e-mail et de mot de passe de l'écran de connexion restent dans index.html (gestionnaires de mots de passe, remplissage auto).

export interface FI18n { tr: (fr: string) => string; L: (fr: string) => string }
const H = ({ html, cls }: { html: string; cls?: string }) => <span className={cls} dangerouslySetInnerHTML={{ __html: html }}></span>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function AuthFeats({ items, i18n }: { items: { icon: string; t: string; d: string }[]; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <>{items.map((x) => <li key={x.t}><H cls="af-ic" html={x.icon} /><span><b>{tr(L(x.t))}</b><span className="small muted">{tr(L(x.d))}</span></span></li>)}</>;
}

export function NsBar({ unlock, lock, i18n }: { unlock: string; lock: string; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <><span className="grow" dangerouslySetInnerHTML={{ __html: `${unlock} ${esc(tr(L("Notes secrètes déverrouillées")))}` }}></span>
    <button type="button" className="mini" data-nslock="1" dangerouslySetInnerHTML={{ __html: `${lock} ${esc(tr(L("Verrouiller")))}` }}></button></>;
}

export function FolderBar({ name, count, editing, q, icon, i18n }: { name: string; count: number; editing: boolean; q: string; icon: string; i18n: FI18n }) {
  const { tr, L } = i18n;
  if (editing) return <form id="folderRename" style={{ display: "flex", gap: "8px", width: "100%" }}><input id="folderRenIn" defaultValue={name} aria-label={tr(L("Nouveau nom"))} autoComplete="off" /><button className="btn" type="submit">{tr("OK")}</button></form>;
  return <>
    <div className="grow"><b className="notr" dangerouslySetInnerHTML={{ __html: `${icon} ${esc(name)}` }}></b><div className="small muted">{tr(`${count} ${L(count > 1 ? "documents" : "document")}`)}</div></div>
    <button className="mini" data-dfren="1">{tr(L("Renommer"))}</button><button className="x" data-dfdel="1" aria-label={tr(L("Supprimer le classeur"))}>×</button>
    <input type="search" className="search" id="folderSearch" style={{ margin: "8px 0 0", width: "100%" }} placeholder={tr(L("Rechercher dans ce classeur"))} aria-label={tr(L("Rechercher dans ce classeur"))} defaultValue={q} autoComplete="off" />
  </>;
}

export function NuSports({ sports, i18n }: { sports: { name: string; freq: string; dur: string }[]; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <>{sports.map((x, i) => <div key={i} className="nu-sport">
    <input className="nu-name" data-sp={i} data-f="name" defaultValue={x.name} placeholder={tr(L("Ex. Musculation"))} aria-label={tr(L("Sport"))} autoComplete="off" />
    <button type="button" className="x" data-sprm={i} aria-label={tr(L("Retirer ce sport"))}>×</button>
    <label className="nu-f"><span>{tr(L("Fois par semaine"))}</span><span className="nu-in"><input data-sp={i} data-f="freq" type="text" inputMode="numeric" maxLength={2} defaultValue={x.freq} autoComplete="off" /><i>{tr(L("/sem"))}</i></span></label>
    <label className="nu-f"><span>{tr(L("Durée d'une séance"))}</span><span className="nu-in"><input data-sp={i} data-f="dur" type="text" maxLength={6} defaultValue={x.dur} placeholder={tr("1h30")} autoComplete="off" /></span></label>
  </div>)}</>;
}

export function NuSlots({ slots, i18n }: { slots: { k: string; on: boolean; icon: string; name: string }[]; i18n: FI18n }) {
  const { tr, L } = i18n;
  // case, icône et nom directement dans le bouton (comme l'ancien rendu)
  return <>{slots.map((s) => <button key={s.k} type="button" className="pill meal-tg" data-pick={s.k} aria-pressed={s.on}
    dangerouslySetInnerHTML={{ __html: `<span class="tg-box" aria-hidden="true">${s.on ? "✓" : ""}</span>${s.icon} ${esc(tr(L(s.name)))}` }}></button>)}</>;
}

export function NuMealKcal({ rows, i18n }: { rows: { icon: string; name: string; kcal: number }[]; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <>{rows.map((r, i) => <div key={i} className="row"><H cls="em" html={r.icon} /><span className="grow">{tr(L(r.name))}</span>
    <span className="nu-in"><input data-mk={i} type="text" inputMode="numeric" maxLength={4} defaultValue={String(r.kcal)} aria-label={tr(`${L("Calories")} ${L(r.name)}`)} /><i>{tr("kcal")}</i></span></div>)}</>;
}

export function NuMkTot({ tot, tg, reset, i18n }: { tot: string; tg: string; reset: boolean; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <>{tr(`${L("Total")} `)}<b>{tot}</b>{tr(` / ${tg} kcal ✓`)}{reset ? <>{" "}<button type="button" className="mini" data-mkreset="1">{tr(L("Répartition conseillée"))}</button></> : null}</>;
}

export function NuKcalOf({ target, over, left, i18n }: { target: number; over: number; left: number; i18n: FI18n }) {
  const { tr, L } = i18n;
  return <>{tr(`${L("sur")} ${target} kcal`)}<br />{over > 0 ? <b style={{ color: "var(--late)" }}>{`+${over}`}</b> : tr(`${L("reste")} ${left}`)}</>;
}
