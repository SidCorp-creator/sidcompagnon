// Coquille → présentation du premier lancement (ticket #3), migrée en v63 : diapositives des 3 apps (fonctions à garder),
// points de navigation, choix des couleurs. Même rendu que openOnb / onbStep / onbLook de site/app.js.
// L'état (fonctions gardées) vient de app.js (onbSel) ; app.js redessine après chaque changement puis remet la diapositive affichée (onbStep).

export interface OI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface OnbTab { k: string; icon: string; label: string; desc: string; on: boolean }
export interface OnbGroup { k: string; app: string; label: string; title: string; sub: string; tabs: OnbTab[] }

export function OnbGroups({ groups, i18n }: { groups: OnbGroup[]; i18n: OI18n }) {
  const { tr, L } = i18n;
  return <>{groups.map((g) => {
    const n = g.tabs.length, any = g.tabs.some((t) => t.on);
    return <section key={g.k} className="onb-slide onb-app" data-app={g.app}><div className="onb-box onb-split">
      <div className="onb-hero"><div className="onb-logo" data-app={g.app}><img className="logo " src={`icons/${g.app}.svg`} alt="" aria-hidden="true" draggable="false" /></div>
        <div className="onb-grp">{tr(g.label)}</div><h1>{tr(L(g.title))}</h1><p className="sub">{tr(L(g.sub))}</p>
        <p className="onb-count">{tr(`${n} ${L(n > 1 ? "fonctions" : "fonction")}`)}</p></div>
      <div className="onb-pick"><div className="onb-pick-h"><span className="eyebrow">{tr(L("Ce que tu gardes"))}</span>{n > 1 ? <button type="button" className="linkbtn onb-all" data-onball={g.k}>{tr(L(any ? "Tout décocher" : "Tout cocher"))}</button> : null}</div>
        <div className="onb-list">{g.tabs.map((t) => <label key={t.k} className={`onb-it ${t.on ? "" : "off"}`} data-onb={t.k}>
          <span className="ic" dangerouslySetInnerHTML={{ __html: t.icon }}></span><span className="grow"><b>{tr(L(t.label))}</b><span className="small muted">{tr(L(t.desc))}</span></span>
          <input type="checkbox" className="switch" data-onbk={t.k} defaultChecked={t.on} aria-label={tr(`${L("Garder")} ${L(t.label)}`)} /></label>)}</div>
        <p className="small muted onb-hint">{tr(L("Touche une ligne pour la garder ou la masquer. Tout reste modifiable dans Réglages."))}</p></div>
    </div></section>;
  })}</>;
}

export function OnbDots({ n, cur }: { n: number; cur: number }) {
  return <>{Array.from({ length: n }, (_, j) => <i key={j} className={j === cur ? "on" : ""}></i>)}</>;
}

export interface PalVM { k: string; name: string; a: string; b: string; on: boolean }
export function OnbPal({ pals, check, i18n }: { pals: PalVM[]; check: string; i18n: OI18n }) {
  return <>{pals.map((p) => <button key={p.k} type="button" className="pal" data-opal={p.k} aria-pressed={p.on}>
    <span className="pal-dot" style={{ "--pa": p.a, "--pb": p.b } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: p.on ? check : "" }}></span>
    <span className="pal-n">{i18n.tr(i18n.L(p.name))}</span></button>)}</>;
}

// v63 : claviers de code (mots de passe #pinPad, fenêtre de code #psPad) : 1 à 9, case vide, 0, « Effacer ».
// Les touchers restent gérés par app.js (padTap), le code tapé ne passe jamais par React.
export function Keypad({ attr, del }: { attr: "pin" | "ps"; del: string }) {
  const k = (v: string) => ({ ["data-" + attr]: v });
  return <>
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} type="button" {...k(String(d))}>{d}</button>)}
    <button type="button" className="blank" tabIndex={-1} aria-hidden="true"></button><button type="button" {...k("0")}>0</button><button type="button" className="del" {...k("del")}>{del}</button>
  </>;
}
