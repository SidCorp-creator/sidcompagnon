import {FormeIcon} from "./FormeIcon";
// sid'fit → Musculation : liste des programmes et des séances (cartes repliables, exercices, une ligne par série), migrée en v55 (ticket #3).
// Même rendu que seCard / renderMuscu de site/app.js. Les champs ne sont pas « contrôlés » (defaultValue) : la saisie reste fluide,
// app.js enregistre à chaque frappe puis redessine (React garde le même champ, le clavier ne se ferme pas).
// Les calculs propres au sport (conseil séries × répétitions, type de séance, fiche d'aide) restent dans app.js et arrivent déjà faits.

export interface MuSet { kg: string; reps: string; state:"done"|"next"|"later" }
export interface MuPrm { reps: string; rest: string; int: string; rpe: string; tempo: string; sum: string; open: boolean }
export interface MuEx { id: string; name: string; help: boolean; link?: boolean; adv: { txt: string; val: string; same: boolean } | null; prm: MuPrm; pro: string; sets: MuSet[] }
export interface MuSe { id: string; name: string; shown: string; letter: string; ty: string; tag: string; open: boolean; sub: string; done: boolean; ex: MuEx[] }
export interface MuGrp { id: string; name: string; free: boolean; sub: string; more: boolean; empty: string; ses: MuSe[] }
export interface MuI18n { tr: (fr: string) => string; L: (fr: string) => string }

const MORE = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="19" cy="12" r="1.9" /></svg>;

// v73 : réglages propres à l'exercice (répétitions visées, repos, intensité, RPE, tempo), repliés par défaut
function ExPrm({ ex, i18n }: { ex: MuEx; i18n: MuI18n }) {
  const { tr, L } = i18n, p = ex.prm;
  return <details className="ex-prm" data-prm={ex.id} open={p.open}><summary className="small">{tr(p.sum)}</summary><div className="ex-prm-g">
    <label><span>{tr(L("Répétitions visées"))}</span><input data-f="xreps" defaultValue={p.reps} placeholder="8–12" maxLength={9} autoComplete="off" /></label>
    <label><span>{tr(L("Repos (secondes)"))}</span><input data-f="xrest" defaultValue={p.rest} placeholder="120" inputMode="numeric" maxLength={3} autoComplete="off" /></label>
    <label><span>{tr(L("Intensité"))}</span><input data-f="xint" defaultValue={p.int} placeholder="70 %" maxLength={16} autoComplete="off" /></label>
    <label><span>RPE</span><input data-f="xrpe" defaultValue={p.rpe} placeholder="8" maxLength={9} autoComplete="off" /></label>
    <label><span>{tr(L("Tempo"))}</span><input data-f="xtempo" defaultValue={p.tempo} placeholder="3-0-1" maxLength={9} autoComplete="off" /></label></div></details>;
}

// v73 : carte « Mes statistiques » (#muStats) : statistique mise en avant selon l'objectif, règle de progression
export interface MuStatsVM { title: string; prog: string; empty: string; rows: { l: string; v: string; u?: boolean; warn?: boolean }[] }
export function MuStats({ vm, i18n }: { vm: MuStatsVM; i18n: MuI18n }) {
  const { tr, L } = i18n;
  return <><div className="mu-st-h"><span className="eyebrow">{tr(L("Mes statistiques"))}</span><span className="small muted">{tr(vm.title)}</span></div>
    {vm.rows.length ? <div className="mu-st-rows">{vm.rows.map((r, i) => <div key={i} className="row"><span className={r.u ? "grow notr" : "grow"}>{r.u ? r.l : tr(r.l)}</span><b className={r.warn ? "warn" : undefined}>{tr(r.v)}</b></div>)}</div>
      : <p className="small muted">{tr(vm.empty)}</p>}
    <p className="small muted mu-st-prog"><b>{tr(L("Progression"))}</b>{tr(` : ${vm.prog}`)}</p></>;
}

function SeCard({ se, trash, i18n }: { se: MuSe; trash: string; i18n: MuI18n }) {
  const { tr, L } = i18n;
  return <details className={"ms" + (se.letter ? "" : " ms-free")} data-ms={se.id} data-se={se.ty || undefined} open={se.open}>
    <summary><span className="chev"><FormeIcon name="chev"/></span><span className="grow">
      <span className="ms-name notr" data-user-label="" title={se.shown}>{se.shown}</span><span className="ms-meta">{se.letter || se.tag ? <span className="se-tag">{se.letter ? <b>{se.letter}</b> : null}{se.tag ? <span>{tr(L(se.tag))}</span> : null}</span> : <span className="se-tag se-free">{tr(L("Libre"))}</span>}<span className="small muted">{tr(se.sub)}</span></span></span>
      <button type="button" className="x ms-del" data-msdel="1" aria-label={tr(L("Supprimer la séance"))} dangerouslySetInnerHTML={{ __html: trash }}></button></summary>
    <div className="ms-body">
      <label className="small muted" style={{ display: "grid", gap: "4px" }}>{tr(L("Nom de la séance"))}<input data-f="msname" defaultValue={se.name} autoComplete="off" /></label>
      {se.ex.map((ex, i) => <div key={ex.id} className="ex ex3" data-ex={ex.id}>
        <div className="ex-head"><span className="num">{i + 1}</span><span className="ex-nm"><input data-f="exname" defaultValue={ex.name} placeholder={tr(L("Nom de l'exercice"))} aria-label={tr(L("Nom de l'exercice"))} autoComplete="off" list="exList" /><span className="ex-n notr" aria-hidden="true">{ex.name}</span></span>
          <button type="button" className="mini ex-help" data-exhelp="1" aria-label={tr(L("Voir comment effectuer cet exercice"))} title={tr(L("Voir comment effectuer cet exercice"))} hidden={!ex.help}><FormeIcon name="help"/></button>
          <button type="button" className="linkbtn ex-link small" data-exlink="1" hidden={!ex.link}>{tr(L("Pas de fiche · associer"))}</button>
          <button type="button" className="x" data-msdelex={ex.id} aria-label={tr(L("Supprimer l'exercice"))}><FormeIcon name="close"/></button></div>
        {ex.adv ? <div className="ex-adv"><span className="grow">{tr(ex.adv.txt)}<b>{ex.adv.val}</b></span>{ex.adv.same ? <span className="ok"><FormeIcon name="check"/></span> : <button type="button" className="linkbtn" data-msadv="1">{tr(L("Appliquer"))}</button>}</div>
          : <div className="ex-adv" hidden></div>}
        <ExPrm ex={ex} i18n={i18n} />
        {ex.pro ? <div className="ex-pro small"><FormeIcon name="arrow"/>{tr(ex.pro)}</div> : null}
        <div className="set-rows">{ex.sets.map((st, j) => <div key={j} className="set-row" data-si={j} data-set-state={st.state}><span className="set-l"><span className="set-mark" hidden={st.state!=="done"}><FormeIcon name="check"/></span>{tr(`${L("Série")} ${j + 1}`)}</span>
          <span className="set-field"><input className="set-in" data-f="setkg" defaultValue={st.kg} placeholder="" aria-label={tr(`${L("Série")} ${j + 1} : kg`)} autoComplete="off" inputMode="decimal" /><span className="set-unit">kg</span></span>
          <span className="set-field"><input className="set-in" data-f="setreps" defaultValue={st.reps} placeholder="" aria-label={tr(`${L("Série")} ${j + 1} : ${L("répétitions")}`)} autoComplete="off" inputMode="numeric" /><span className="set-unit">{tr("reps")}</span></span>
          <button type="button" className="set-del" data-msdelset={j} aria-label={tr(`${L("Retirer la série")} ${j + 1}`)} disabled={ex.sets.length <= 1}><FormeIcon name="close"/></button></div>)}</div>
        <div className="set-acts"><button type="button" className="set-add" data-msaddset="1" disabled={ex.sets.length >= 20}><FormeIcon name="plus"/>{tr(L("Ajouter une série"))}</button>
          {ex.sets.length > 1 ? <button type="button" className="set-add set-copy" data-mscopy1="1" title={tr(L("Recopier le poids et les répétitions de la série 1 dans toutes les séries"))}><FormeIcon name="copy"/>{tr(L("Série 1 sur toutes"))}</button> : null}</div>
      </div>)}
      <button type="button" className="qbtn" data-msaddex="1"><FormeIcon name="plus"/>{tr(L("Ajouter un exercice"))}</button>
      <div className="ms-actions">
        <button type="button" className="btn ghost" data-msshare="1">{tr(L("Partager"))}</button>
        <button type="button" className="btn stop" data-msdel="1">{tr(L("Supprimer"))}</button>
      </div>
    </div></details>;
}

export function MuList({ groups, trash, i18n }: { groups: MuGrp[]; trash: string; i18n: MuI18n }) {
  const { tr, L } = i18n;
  return <>{groups.map((g) => <section key={g.free ? "-free" : g.id} className="ms-grp" data-msgrp={g.id}>
    <div className="ms-grp-h"><div className="grow"><span className={g.free ? "eyebrow" : "eyebrow notr"}>{g.free ? tr(g.name) : g.name}</span><span className="small muted">{tr(g.sub)}</span></div>
      {g.more ? <button type="button" className="pen" data-msgact={g.id} aria-label={tr(L(g.free ? "Actions des séances libres" : "Actions du programme"))}>{MORE}</button> : null}</div>
    {g.ses.length ? g.ses.map((se) => <SeCard key={se.id} se={se} trash={trash} i18n={i18n} />) : <div className="small muted">{tr(g.empty)}</div>}
  </section>)}</>;
}
