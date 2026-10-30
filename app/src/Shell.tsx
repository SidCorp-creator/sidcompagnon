// Coquille → barres de navigation (ticket #3, étape 3) : barre du bas d'une app (#navIn), en-tête d'une app (#vhead), barre latérale (#side).
// Même rendu que renderNav / renderVhead / renderSide de site/app.js ; les clics (data-go, data-sadd, .side-tog) restent gérés par app.js.
// Les icônes arrivent en SVG (chaînes de l'app), posées telles quelles.

export interface NavI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface NavItem { k: string; icon: string; label: string; badge: number | "dot" | 0; meta?: string }
export interface SideGroup { app: string; label: string; items: NavItem[] }

const Logo = ({ app, cls }: { app: string; cls: string }) => <img className={`logo ${cls}`} src={`icons/${app}.svg`} alt="" aria-hidden="true" draggable="false" />;
const Ic = ({ cls, html }: { cls: string; html: string }) => <span className={cls} dangerouslySetInnerHTML={{ __html: html }}></span>;

function Badge({ b, i18n }: { b: NavItem["badge"]; i18n: NavI18n }) {
  if (!b) return null;
  return b === "dot" ? <i className="sbadge dot" aria-label={i18n.tr(i18n.L("En cours"))}></i> : <i className="sbadge">{b > 99 ? "99+" : b}</i>;
}

export function NavBar({ items, cur, i18n }: { items: NavItem[]; cur: string; i18n: NavI18n }) {
  return <>{items.map((t) => <button key={t.k} type="button" className="tab" data-go={t.k} aria-current={t.k === cur ? "page" : undefined}>
    <Ic cls="tabicon" html={t.icon} /><span className="tab-l">{i18n.tr(i18n.L(t.label))}</span><Badge b={t.badge} i18n={i18n} />
  </button>)}</>;
}

export function AppHead({ app, label, gridIcon, i18n }: { app: string; label: string; gridIcon: string; i18n: NavI18n }) {
  return <>
    <span className="ah-brand"><Logo app={app} cls="ah-logo" /><span className="eyebrow">{i18n.tr(label)}</span></span>
    <button type="button" className="ah-home" data-go="home" aria-label={i18n.tr(i18n.L("Retour à Sid'compagnon"))} dangerouslySetInnerHTML={{ __html: `${gridIcon}<span>Sid'compagnon</span>` }}></button>
  </>;
}

export interface SideIcons { side: string; home: string; plus: string; user: string }
export function SideBar({ groups, cur, icons, i18n }: { groups: SideGroup[]; cur: string; icons: SideIcons; i18n: NavI18n }) {
  const { tr, L } = i18n;
  return <>
    <div className="side-brand"><Logo app="home" cls="side-logo" /><span className="grow">Sid'compagnon</span>
      <button type="button" className="side-tog" aria-label={tr(L("Masquer la barre latérale"))} title={tr(L("Masquer la barre latérale"))} aria-expanded="true" aria-controls="side" dangerouslySetInnerHTML={{ __html: icons.side }}></button></div>
    <button type="button" className="side-it" data-go="home" aria-current={cur === "home" ? "true" : "false"}><Ic cls="sp-ic" html={icons.home} /><span className="grow">{tr(L("Aujourd'hui"))}</span></button>
    <button type="button" className="side-add" data-sadd="1"><Ic cls="sp-ic" html={icons.plus} /><span className="grow">{tr(L("Ajouter"))}</span></button>
    {groups.map((g) => <div key={g.app + g.label} className="side-grp" data-app={g.app}>
      <div className="eyebrow side-h">{g.app !== "home" ? <Logo app={g.app} cls="side-applogo" /> : null}{tr(g.label)}</div>
      {g.items.map((t) => <button key={t.k} type="button" className="side-it" data-go={t.k} aria-current={cur === t.k ? "true" : "false"}>
        <Ic cls="sp-ic" html={t.icon || icons.user} /><span className="grow">{tr(L(t.label))}</span><span className="sp-meta">{tr(t.meta || "")}</span></button>)}
    </div>)}
  </>;
}
