// sid'fit → Nutrition : menu généré (repas, aliments, quantités, recette), migré en v58 (ticket #3).
// Même rendu que renderNuMenu de site/app.js. app.js garde la main sur #nuMenu pendant le chargement d'un menu
// (animation nuLoading) et l'y rend ensuite (SCIslands.unmount). « ↻ Autre idée » n'écrit plus dans le bouton : il redessine.
import type { CSSProperties } from "react";
import type { Mac, NuI18n, Sum } from "./Nutrition";

type Css = CSSProperties & Record<string, string | number>;
export interface MeItem { name: string; g: number; qty: string; qtyLbl: string; kcal: number }
export interface MeMeal { name: string; mono: string; slot: string; target: number; kcal: number; sum: Sum; items: MeItem[]; ate: boolean; steps: string[] | null }
export interface MenuVM { meals: MeMeal[]; total: Sum; tips: string; edit: string | null; add: number | null; recipe: number | null; recipeBusy: boolean; regen: number | null }

const r1 = (x: number) => Math.round((+x || 0) * 10) / 10, r0 = (x: number) => Math.round(+x || 0);
const PEN = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function Boxes({ items, i18n }: { items: [string | number, string, string?][]; i18n: NuI18n }) {
  return <div className={`nu-plan ${items.length === 4 ? "four" : ""}`}>{items.map(([v, l, c], i) => <div key={i}><b>{i18n.tr(String(v))}</b><span>{c ? <span className="mdot" style={{ "--c": `var(${c})` } as Css}></span> : null}{i18n.tr(i18n.L(l))}</span></div>)}</div>;
}
function Macros({ s, mac, i18n }: { s: Sum; mac: Mac[]; i18n: NuI18n }) {
  const tot = (s.p * 4 + s.c * 4 + s.f * 9) || 1;
  return <>
    <div className="mbar" aria-hidden="true">{mac.map((m) => <i key={m.k} style={{ "--c": `var(${m.c})`, width: `${(m.k === "f" ? 9 : 4) * s[m.k] / tot * 100}%` } as Css}></i>)}</div>
    <div className="mchips">{mac.map((m) => <span key={m.k} className="mchip"><b>{i18n.tr(`${r1(s[m.k])} g`)}</b><span><span className="mdot" style={{ "--c": `var(${m.c})` } as Css}></span>{i18n.tr(i18n.L(m.label))}</span></span>)}</div>
  </>;
}

export function NuMenu({ m, mac, icons, i18n }: { m: MenuVM | null; mac: Mac[]; icons: { book: string }; i18n: NuI18n }) {
  const { tr, L } = i18n;
  if (!m) return <div className="card"><div className="empty">{tr(L("Choisis tes repas, puis touche « Générer »."))}</div></div>;
  const T = m.total;
  return <>
    <h2 style={{ marginTop: "16px" }}>{tr(L("Ton menu"))}</h2>
    <Boxes i18n={i18n} items={[[r0(T.kcal), "kcal"], [r1(T.p) + " g", "Protéines", "--m-p"], [r1(T.c) + " g", "Glucides", "--m-c"], [r1(T.f) + " g", "Lipides", "--m-f"]]} />
    {m.meals.map((ml, i) => <div key={i} className="dish">
      <div className="dish-h"><span className="dish-ic">{ml.mono}</span><span className="dish-t"><b className="notr">{ml.name}</b><span className="small muted">{tr(`${L(ml.slot)}${ml.target ? ` · ${L("objectif")} ${ml.target} kcal` : ""}`)}</span></span>
        <span className="dish-kcal">{ml.kcal}<small>{tr("kcal")}</small></span><button type="button" className="x" data-medel={i} aria-label={tr(L("Retirer ce repas"))}>×</button></div>
      <Macros s={ml.sum} mac={mac} i18n={i18n} />
      <div className="dish-items">{ml.items.map((x, j) => <div key={j} className="dish-it"><span className="em">·</span><div className="grow"><b className="notr">{x.name}</b>
        {m.edit === `${i}:${j}` ? <span className="me-qty"><input type="text" inputMode="decimal" id="meQtyIn" defaultValue={x.g || ""} aria-label={tr(L("Grammes"))} />{tr(" g ")}<button type="button" className="mini" data-meqok={`${i}:${j}`}>{tr("OK")}</button></span>
          : x.g ? <button type="button" className="qty-ed notr" data-meq={`${i}:${j}`} aria-label={tr(L("Changer la quantité"))}>{x.qtyLbl}</button> : <span className="small muted notr">{x.qty}</span>}</div>
        <span className="k">{tr(`${x.kcal} kcal`)}</span>{x.g ? <button className="pen" data-meq={`${i}:${j}`} aria-label={tr(L("Changer la quantité"))}>{PEN}</button> : null}<button className="x" data-merm={`${i}:${j}`} aria-label={tr(L("Retirer"))}>×</button></div>)}</div>
      {m.add === i ? <form className="me-add" data-meaddf={i}><input id="meAddIn" placeholder={tr(L("Ex. 30 g d'amandes"))} autoComplete="off" /><button className="btn" type="submit">{tr("OK")}</button></form> : null}
      {m.recipe === i ? <div className="recipe"><b dangerouslySetInnerHTML={{ __html: `${icons.book} ${esc(tr(L("Recette")))}` }}></b>
        {m.recipeBusy ? <div className="small muted" style={{ marginTop: "6px" }}><span className="spin"></span>{tr(` ${L("Préparation de la recette…")}`)}</div>
          : ml.steps && ml.steps.length ? <ol className="notr">{ml.steps.map((s, k) => <li key={k}>{s}</li>)}</ol> : <div className="small muted">{tr(L("Recette indisponible pour le moment."))}</div>}</div> : null}
      <div className="me-act"><button type="button" className="mini" data-meadd={i}>{tr(`+ ${L("Aliment")}`)}</button>
        <button type="button" className="mini" data-merec={i} dangerouslySetInnerHTML={{ __html: `${icons.book} ${esc(tr(L(m.recipe === i ? "Cacher la recette" : "Recette")))}` }}></button>
        {m.regen === i ? <button type="button" className="mini" data-meregen={i}><span className="spin"></span></button> : <button type="button" className="mini" data-meregen={i}>{tr(`↻ ${L("Autre idée")}`)}</button>}
        {ml.ate ? <span className="me-done">{tr(`✓ ${L("Dans ta journée")}`)}</span> : <button type="button" className="mini" data-numeal={i} style={{ background: "var(--accent)", color: "var(--on-accent)" }}>{tr(`＋ ${L("Ajouter à ma journée")}`)}</button>}</div>
    </div>)}
    {m.tips ? <p className="small muted notr" style={{ margin: "6px 4px" }}>{m.tips}</p> : null}
  </>;
}
