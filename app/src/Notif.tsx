// Notifications (ticket #3, v68) : bloc « notifications » (Réglages et Agenda, .notif-box) et « Me prévenir » des fiches d'activité (#fRem, #eRem).
// Même rendu que renderLeads / renderRem de site/app.js ; clics, cases et formulaires restent gérés par app.js (délégation).
// Champs non contrôlés : React garde ce qui est en cours de saisie (durée « Autre délai »).

export interface NI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface Lead { m: number; lbl: string; on: boolean }
type NfKind = "na" | "on" | "off";

function Custom({ form, i18n }: { form: boolean; i18n: NI18n }) {
  const { tr, L } = i18n;
  const inner = <>
    <input type="text" inputMode="numeric" maxLength={3} {...(form ? { name: "n" } : { "data-rn": "" })} placeholder="15" aria-label={tr(L("Durée"))} autoComplete="off" />
    <select className="sel" {...(form ? { name: "u" } : { "data-ru": "" })} aria-label={tr(L("Unité"))} defaultValue="60"><option value="1">{tr(L("minutes"))}</option><option value="60">{tr(L("heures"))}</option><option value="1440">{tr(L("jours"))}</option></select>
    <span className="small muted">{tr(L("avant"))}</span>
    {form ? <button className="btn" type="submit" style={{ padding: "8px 14px" }}>OK</button> : <button type="button" className="btn" data-rok="1" style={{ padding: "8px 14px" }}>OK</button>}
  </>;
  return form ? <form className="notif-lead-custom" data-nf="customf">{inner}</form> : <div className="notif-lead-custom">{inner}</div>;
}

export function NotifBox({ kind, msg, leads, custom, cals, ical, i18n }: { kind: NfKind; msg: string; leads: Lead[]; custom: boolean; cals: boolean; ical: boolean; i18n: NI18n }) {
  const { tr, L } = i18n;
  const on = kind === "on";
  return <>
    <div className="card">
      <div className="row"><div className="grow">{tr(L("Sois prévenu avant chaque activité du planning."))}<div className="small muted">
        {kind === "na" ? tr(L(msg)) : on ? <><span className="syncdot"></span>{tr(L("Activés sur cet appareil"))}</> : tr(L("Désactivés sur cet appareil."))}</div></div></div>
      {kind === "na" ? null : <div className="row" style={{ gap: "8px" }}><button type="button" className={`btn ${on ? "ghost" : ""}`} data-nf="toggle" style={{ flex: "1" }}>{tr(L(on ? "Désactiver" : "Activer les notifications"))}</button>
        {on ? <button type="button" className="btn ghost" data-nf="test">{tr(L("Tester"))}</button> : null}</div>}
    </div>
    <div className="label" style={{ margin: "12px 4px 6px" }}>{tr(L("Me prévenir"))}</div>
    <div className="chips" style={{ flexWrap: "wrap", margin: "0", paddingInline: "0" }}>
      {leads.map((x) => x.m === 1440
        ? <span key={x.m} className="pill lock" aria-pressed="true" title={tr(L("Toujours active"))}>{tr(`${x.lbl} · ${L("toujours")}`)}</span>
        : <button key={x.m} type="button" className="pill" data-lead={x.m} aria-pressed={x.on}>{tr(x.lbl)}</button>)}
      <button type="button" className="pill add" data-nf="custom">{tr(`+ ${L("Autre délai")}`)}</button></div>
    {custom ? <Custom form={true} i18n={i18n} /> : null}
    {cals ? <label className="nf-ical"><input type="checkbox" data-nf="ical" defaultChecked={ical} />{" "}<span>{tr(L("Cours du calendrier relié : mêmes rappels que tes activités"))}</span></label> : null}
    <p className="small muted" style={{ margin: "8px 4px 0" }}>{tr(L("Tu peux en choisir plusieurs. Une activité sans heure compte pour 8 h. Sur smartphone, ouvre Sid'compagnon depuis l'écran d'accueil (iOS 16.4 ou plus)."))}</p>
  </>;
}

export function RemBox({ kind, msg, leads, custom, bell, i18n }: { kind: NfKind; msg: string; leads: Lead[]; custom: boolean; bell: string; i18n: NI18n }) {
  const { tr, L } = i18n;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return <>
    <div className="rem-h" dangerouslySetInnerHTML={{ __html: `${bell} ${esc(tr(L("Me prévenir")))}` }}></div>
    <div className="rem-chips">{leads.map((x) => x.m === 1440
      ? <span key={x.m} className="pill lock" aria-pressed="true">{tr(`${x.lbl} · ${L("toujours")}`)}</span>
      : <button key={x.m} type="button" className="pill" data-rl={x.m} aria-pressed={x.on}>{tr(x.lbl)}</button>)}
      <button type="button" className="pill add" data-rcustom="1">{tr(`+ ${L("Autre")}`)}</button></div>
    {custom ? <Custom form={false} i18n={i18n} /> : null}
    {kind === "on" ? <div className="small muted">{tr(L("Sans heure, l'activité compte pour 8 h."))}</div>
      : kind === "na" ? <div className="small muted">{tr(L(msg))}</div>
        : <button type="button" className="btn ghost rem-on" data-ron="1" dangerouslySetInnerHTML={{ __html: `${bell} ${esc(tr(L("Activer les notifications")))}` }}></button>}
  </>;
}
