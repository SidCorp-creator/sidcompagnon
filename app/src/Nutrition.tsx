// sid'fit → Nutrition : plats de la journée, résultat d'une analyse, sport de la semaine. Migré en v56 (ticket #3).
// Même rendu que renderNutri / renderNuResult / renderNuWeek / macroHtml / qtyCell de site/app.js : les clics restent gérés par app.js.
// app.js prépare les plats (regroupement, quantités lisibles, vignettes) et React les dessine.
import type { CSSProperties } from "react";

type Css = CSSProperties & Record<string, string | number>;
export interface NuI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface Mac { k: "p" | "c" | "f"; label: string; c: string }
export interface Sum { kcal: number; p: number; c: number; f: number }
/** Une quantité modifiable : key = « log:<id> » ou « res:<n> » ; editing = champ ouvert. */
export interface Qty { key: string; label: string; value: string; editing: boolean }
export interface DishItem { id: string; name: string; kcal: number; qty: Qty; extra?: boolean }
export interface Dish { g: string; name: string; mono: string; thumb: string | null; time: string; sum: Sum; items: DishItem[] }
export interface NuResultVM { title: string; mono: string; photo: string | null; mem: boolean; note: string; sum: Sum; items: DishItem[] }
export interface WeekSport { name: string; kps: number; count: number; base: number }

const r0 = (x: number) => Math.round(+x || 0), r1 = (x: number) => Math.round((+x || 0) * 10) / 10;
const two = (n: number) => String(n).padStart(2, "0");
const PEN = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>;
const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const hhmm = (iso: string) => { const d = new Date(iso); return `${two(d.getHours())}:${two(d.getMinutes())}`; };

/** Barre et pastilles de macros d'un plat. */
function Macros({ s, mac, i18n }: { s: Sum; mac: Mac[]; i18n: NuI18n }) {
  const tot = (s.p * 4 + s.c * 4 + s.f * 9) || 1;
  return <>
    <div className="mbar" aria-hidden="true">{mac.map((m) => <i key={m.k} style={{ "--c": `var(${m.c})`, width: `${(m.k === "f" ? 9 : 4) * s[m.k] / tot * 100}%` } as Css}></i>)}</div>
    <div className="mchips">{mac.map((m) => <span key={m.k} className="mchip"><b>{i18n.tr(`${r1(s[m.k])} g`)}</b><span><span className="mdot" style={{ "--c": `var(${m.c})` } as Css}></span>{i18n.tr(i18n.L(m.label))}</span></span>)}</div>
  </>;
}

function QtyCell({ q, i18n }: { q: Qty; i18n: NuI18n }) {
  const { tr, L } = i18n;
  if (q.editing) return <span className="qty-in"><input id="qtyEdIn" defaultValue={q.value} placeholder={tr(L("Ex. 150 g"))} aria-label={tr(L("Quantité"))} autoComplete="off" enterKeyHint="done" /><button type="button" className="mini" data-qok={q.key}>{tr("OK")}</button></span>;
  return <button type="button" className="qty-ed notr" data-qed={q.key}>{`${q.label || L("Ajouter une quantité")} ✎`}</button>;
}

export function NuLog({ dishes, mac, today, i18n }: { dishes: Dish[]; mac: Mac[]; today: boolean; i18n: NuI18n }) {
  const { tr, L } = i18n;
  if (!dishes.length) return <div className="card"><div className="empty">{tr(L(today ? "Rien pour l'instant. Écris ce que tu manges ci-dessus, ou prends ton plat en photo." : "Rien d'enregistré ce jour-là. Tu peux encore le compléter."))}</div></div>;
  return <>{dishes.map((G) => {
    const one = G.items.length === 1;
    return <details key={G.g} className="dish" open>
      <summary className="dish-h"><span className="dish-ic" data-thumb={G.g}>{G.thumb ? <img src={G.thumb} alt="" /> : G.mono}</span>
        <span className="dish-t"><b className="notr">{G.name}</b><span className="dish-time">{G.time}</span>{!one ? <>{" "}<span className="small muted">{tr(`· ${G.items.length} ${L("aliments")}`)}</span></> : null}</span>
        <span className="dish-kcal">{r0(G.sum.kcal)}<small>{tr("kcal")}</small></span>
        <button type="button" className="pen nu-cp" data-nucopy={G.g} aria-label={tr(L("Copier ce repas sur d'autres jours"))} title={tr(L("Copier sur d'autres jours"))}>+</button>
        {one ? <button className="pen" data-nuedit={G.items[0].id} aria-label={tr(L("Modifier"))}>{PEN}</button> : null}
        <button type="button" className="x" data-nudelg={G.g} aria-label={tr(L("Supprimer ce plat"))}>×</button></summary>
      <Macros s={G.sum} mac={mac} i18n={i18n} />
      {one ? <div className="dish-note"><QtyCell q={G.items[0].qty} i18n={i18n} /></div>
        : <div className="dish-items">{G.items.map((x) => <div key={x.id} className="dish-it"><span className="em">·</span><div className="grow"><b className="notr">{x.name}</b><QtyCell q={x.qty} i18n={i18n} /></div>
          <span className="k">{tr(`${r0(x.kcal)} kcal`)}</span><button className="pen" data-nuedit={x.id} aria-label={tr(L("Modifier"))}>{PEN}</button><button className="x" data-nudel={x.id} aria-label={tr(L("Supprimer"))}>×</button></div>)}</div>}
    </details>;
  })}</>;
}

export function NuResult({ p, mac, boltIcon, i18n }: { p: NuResultVM | null; mac: Mac[]; boltIcon: string; i18n: NuI18n }) {
  const { tr, L } = i18n;
  if (!p) return null;
  const s = p.sum;
  return <div className="dish">
    <div className="dish-h"><span className="dish-ic">{p.photo ? <img src={p.photo} alt="" /> : p.mono}</span>
      <span className="dish-t"><b className="notr">{p.title}</b><span className="small muted">{tr(`${p.items.length} ${L(p.items.length > 1 ? "aliments" : "aliment")}`)}</span>
        {p.mem ? <span className="memtag" dangerouslySetInnerHTML={{ __html: `${boltIcon} ${escHtml(tr(L("Mémoire Sid'note")))}` }}></span> : null}</span>
      <span className="dish-kcal">{r0(s.kcal)}<small>{tr("kcal")}</small></span></div>
    <Macros s={s} mac={mac} i18n={i18n} />
    <div className="dish-items">{p.items.map((x, i) => <div key={i} className="dish-it"><span className="em">·</span><div className="grow"><b className="notr">{x.name}</b>{x.extra ? <span className="notmention">{tr(L("pas dans ta description"))}</span> : null}<QtyCell q={x.qty} i18n={i18n} /></div>
      <span className="k">{tr(`${x.kcal} kcal`)}</span><button type="button" className="x" data-nurm={i} aria-label={tr(L("Retirer"))}>×</button></div>)}</div>
    {p.note ? <div className="dish-note notr" style={{ paddingTop: "8px" }}>{p.note}</div> : null}
    <div className="dish-act"><button type="button" className="btn ghost" data-nucancel="1">{tr(L("Annuler"))}</button><button type="button" className="btn" data-nuadd="1">{tr(`${L("Ajouter")} · ${r0(s.kcal)} kcal`)}</button></div>
  </div>;
}

export function NuWeek({ sports, range, target, delta, actIcon, i18n }: { sports: WeekSport[]; range: string; target: string; delta: number; actIcon: string; i18n: NuI18n }) {
  const { tr, L } = i18n;
  return <>
    <div className="nu-week-h"><b dangerouslySetInnerHTML={{ __html: `${actIcon} ${escHtml(tr(L("Ton sport cette semaine")))}` }}></b><span className="small muted">{tr(range)}</span></div>
    {sports.map((s) => <div key={s.name} className="nu-wsp"><div className="grow"><b className="notr">{s.name}</b><span className="small muted">{tr(`≈ ${s.kps} kcal ${L("par séance")}${s.count !== s.base ? ` · ${L("d'habitude")} ${s.base}` : ""}`)}</span></div>
      <div className="stepper"><button type="button" data-ws={s.name} data-d="-1" aria-label={tr(L("Une séance de moins"))}>−</button><output>{s.count}</output><button type="button" data-ws={s.name} data-d="1" aria-label={tr(L("Une séance de plus"))}>+</button></div></div>)}
    <div className="small">{tr(`${L("Objectif par jour cette semaine")} : `)}<b>{tr(`${target} kcal`)}</b>{delta ? <>{" "}<span className="muted">{tr(`(${delta > 0 ? "+" : ""}${delta} ${L("selon ton sport")})`)}</span></> : null}</div>
  </>;
}
