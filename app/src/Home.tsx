// Sid'compagnon → page d'accueil : 3 grandes cartes (une par app), migrées en v58 (ticket #3).
// Même rendu que renderHome de site/app.js : app.js choisit les repères du jour, React dessine ; toucher une carte reste géré par app.js.

export interface HcItem { k: string; v: string; user: boolean; w: string } // user = contenu de la personne (titre d'activité, de note…), jamais traduit
export interface HcCard { app: string; k: string; label: string; desc: string; items: HcItem[] }

export function HomeCards({ cards, i18n }: { cards: HcCard[]; i18n: { tr: (s: string) => string; L: (s: string) => string } }) {
  const { tr, L } = i18n;
  return <div className="hc-list">{cards.map((c) => <button key={c.k} type="button" className="hc" data-app={c.app} data-gapp={c.k}>
    <span className="hc-top"><img className="logo home-applogo hc-logo" src={`icons/${c.app}.svg`} alt="" aria-hidden="true" draggable="false" /><span className="hc-name">{tr(c.label)}</span><span className="hc-go" aria-hidden="true">›</span></span>
    <span className="hc-desc">{tr(L(c.desc))}</span>
    <span className="hc-items">{c.items.map((it, i) => <span key={i} className="hc-it"><span className="hc-k">{tr(it.k)}</span>
      <span className="hc-v">{it.user ? <span className="notr">{it.v}</span> : tr(it.v)}{it.w ? <>{" "}<span className="hc-w">{tr(`· ${it.w}`)}</span></> : null}</span></span>)}</span>
  </button>)}</div>;
}
