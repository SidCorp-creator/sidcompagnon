// sid'agenda → Tâches, migré en v54 (ticket #3) : pastilles de catégories, barre de la catégorie, listes à faire / en suspens / réalisées
// (groupées par année, mois, semaine, jour, ou en calendrier). Même rendu que renderTodos de site/app.js (mêmes classes et data-*) :
// les clics, le glisser-déposer et les formulaires restent gérés par app.js.
import type { ReactNode } from "react";
import { iso, monthCells, parse } from "./dates";
import type { Todo, TodoCat } from "./types";

export interface TdI18n { tr: (fr: string) => string; L: (fr: string) => string; MOL: string[]; MO: string[]; DOW: string[]; DOWL: string[]; lang: string }
export interface TodoView { cat: string; fold: Record<string, unknown>; doneOpen: boolean; pausedOpen: boolean; showFin: boolean; doneCal: boolean }
export interface TodosProps {
  todos: Todo[]; // toutes les tâches (comptes par catégorie)
  cats: TodoCat[];
  open: Todo[]; // listes déjà filtrées (catégorie, recherche) et triées par app.js
  paused: Todo[];
  done: Todo[];
  view: TodoView; // cat = catégorie affichée (« all », « none » ou id)
  search: boolean; // recherche en cours (tout est déplié)
  grip: boolean; // poignée de déplacement (pas pendant une recherche)
  catEditing: boolean;
  freshId: string | null;
  today: string;
  dcMonth: number; // mois du calendrier des réalisées (année × 12 + mois)
  dcSel: string | null;
  i18n: TdI18n;
}

const two = (n: number) => String(n).padStart(2, "0");
const CHECK = <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CHEV = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
const GRIP = <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><circle cx="4" cy="4" r="1.6" /><circle cx="10" cy="4" r="1.6" /><circle cx="4" cy="9" r="1.6" /><circle cx="10" cy="9" r="1.6" /><circle cx="4" cy="14" r="1.6" /><circle cx="10" cy="14" r="1.6" /></svg>;
const MORE = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="19" cy="12" r="1.9" /></svg>;
const mondayOf = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const doneDate = (t: Todo) => new Date(t.doneAt || t.createdAt);

/** Contexte commun aux lignes (comme les variables globales de l'ancien code). */
interface RowCtx { p: TodosProps; catOf: (id?: string) => TodoCat | undefined }

function TodoRow({ t, x }: { t: Todo; x: RowCtx }) {
  const { p, catOf } = x, { tr, L, DOW, MO } = p.i18n, today = p.today;
  const fresh = t.id === p.freshId ? "fresh" : "";
  // dans le titre (classe ttl, jamais traduite automatiquement) : catégorie (vue « Toutes ») ou date prévue
  const cat = t.cat ? catOf(t.cat) : undefined;
  const catLbl = cat && p.view.cat === "all" ? <>{" "}<span className="small muted">{`· ${cat.name}`}</span></> : null;
  const dayLbl = (k: string) => {
    if (k === today) return L("Aujourd'hui");
    const d = parse(k), tm = parse(today); tm.setDate(tm.getDate() + 1);
    if (k === iso(tm)) return L("Demain");
    return `${DOW[d.getDay()].slice(0, 3)}. ${d.getDate()} ${MO[d.getMonth()]}`;
  };
  const late = !t.done && t.day && t.day < today ? 1 : 0, tDay = t.day && t.day < today ? today : t.day;
  const chip = t.done || !t.day ? null : <>{" "}<span className={`tchip ${late ? "late" : tDay === today ? "today" : ""}`}>{late ? `↻ ${L("reportée")}` : dayLbl(t.day)}</span></>;
  const ttl = (extra: ReactNode) => <button type="button" className="grow ttl ttl-btn" data-edit={"todo:" + t.id}>{t.title}{extra}</button>;
  const more = <button className="pen" data-tmore={t.id} aria-label={tr("Plus d'actions")}>{MORE}</button>;
  if (t.done) {
    const d = doneDate(t);
    return <div className={`row done ${fresh}`}><span className="donetime">{`${two(d.getHours())}:${two(d.getMinutes())}`}</span>
      <button className="check" data-tg={t.id} aria-label={tr("Remettre à faire")}>{CHECK}</button>{ttl(catLbl)}{more}</div>;
  }
  if (t.paused) return <div className={`row paused ${fresh}`}>{ttl(catLbl)}<button className="resume" data-resume={t.id}>{tr("Reprendre")}</button>{more}</div>;
  return <div className={`row ${fresh}`} data-tid={t.id}>
    {p.grip ? <button className="grip" data-grip="1" aria-label={tr("Déplacer")} title={tr("Maintenir et glisser pour déplacer")}>{GRIP}</button> : null}
    <button className="check" data-tg={t.id} aria-label={tr("Terminer")}></button>{ttl(chip)}{more}</div>;
}

export function TodoCats({ p }: { p: TodosProps }) {
  const { tr, L } = p.i18n, cc = p.view.cat, T = p.todos, has = (id: string) => p.cats.some((c) => c.id === id);
  const openN = (id: string) => T.filter((t) => !t.done && !t.paused && (id === "none" ? !(t.cat && has(t.cat)) : t.cat === id)).length;
  const finished = (c: TodoCat) => !openN(c.id) && !T.some((t) => t.cat === c.id && t.paused) && T.some((t) => t.cat === c.id && t.done);
  const fin = p.cats.filter(finished), showFin = p.view.showFin || fin.some((c) => c.id === cc);
  return <>
    <button className="pill" data-tcat="all" aria-pressed={cc === "all"}>{tr("Toutes")}</button>
    {p.cats.filter((c) => !finished(c)).map((c) => <button key={c.id} className="pill" data-tcat={c.id} aria-pressed={cc === c.id}>{tr(c.name + " ")}<span className="cnt">{openN(c.id) || ""}</span></button>)}
    {fin.length ? <button className="pill" data-tcatfin="1" aria-pressed={showFin}>{tr(`✓ ${fin.length} ${L(fin.length > 1 ? "terminées" : "terminée")}`)}</button> : null}
    {fin.length && showFin ? fin.map((c) => <button key={"f" + c.id} className="pill" data-tcat={c.id} aria-pressed={cc === c.id} style={{ opacity: .75 }}>{tr(`✓ ${c.name}`)}</button>) : null}
    <button className="pill add" data-tcatnew="1">{tr(`+ ${L("Catégorie")}`)}</button>
  </>;
}

const prog = (dn: number, tot: number) => ({ width: `${tot ? dn / tot * 100 : 0}%` });

export function CatBar({ p }: { p: TodosProps }) {
  const { tr, L } = p.i18n, cat = p.cats.find((c) => c.id === p.view.cat);
  if (!cat) return null;
  if (p.catEditing) return <form id="catRename" style={{ display: "flex", gap: "8px", width: "100%" }}><input id="catRenIn" defaultValue={cat.name} aria-label={tr("Nouveau nom")} autoComplete="off" /><button className="btn" type="submit">{tr("OK")}</button></form>;
  const tot = p.todos.filter((t) => t.cat === cat.id && !t.paused).length, dn = p.todos.filter((t) => t.cat === cat.id && t.done).length;
  return <>
    <div className="grow"><b>{tr(cat.name)}</b><div className="small muted">{tr(tot ? `${dn}/${tot} ${L("réalisées")}` : L("Aucune tâche pour l'instant"))}</div></div>
    <div className="cat-prog" style={{ width: "70px" }}><i style={prog(dn, tot)}></i></div>
    <button className="mini" data-catren="1">{tr(L("Renommer"))}</button><button className="x" data-catdel="1" aria-label={tr("Supprimer la catégorie")}>×</button>
  </>;
}

export function TodoOpen({ p, x }: { p: TodosProps; x: RowCtx }) {
  const { tr, L } = p.i18n, cc = p.view.cat, cats = p.cats, open = p.open, row = (t: Todo) => <TodoRow key={t.id} t={t} x={x} />;
  if (cc === "all" && cats.length && open.length) {
    // les tâches sans catégorie d'abord, puis chaque catégorie (repliable)
    const groups = [{ c: null as TodoCat | null, items: open.filter((t) => !(t.cat && x.catOf(t.cat))) }, ...cats.map((c) => ({ c, items: open.filter((t) => t.cat === c.id) }))].filter((g) => g.items.length);
    const fold = p.view.fold, allFolded = groups.every((g) => fold[g.c ? g.c.id : "none"]);
    const fbtn = (k: string) => <button className="foldc" data-tfold={k} aria-expanded={!fold[k]} aria-label={tr(fold[k] ? "Déplier" : "Replier")}>{CHEV}</button>;
    const body = (k: string, items: Todo[]) => fold[k] ? null : <div key={"b" + k} className="card" data-group={k}>{items.map(row)}</div>;
    const cnt = (k: string, n: number) => fold[k] ? <span className="fold-n">{n}</span> : null;
    return <>
      {groups.length > 1 ? <div style={{ display: "flex", justifyContent: "flex-end", margin: "-4px 0 -10px" }}><button type="button" className="mini" data-tfoldall="1">{tr(allFolded ? "Tout déplier" : "Tout replier")}</button></div> : null}
      {groups.map((g) => {
        if (!g.c) return [<div key="hnone" className="cat-h">{fbtn("none")}<h2>{tr(L("Sans catégorie"))}</h2>{cnt("none", g.items.length)}</div>, body("none", g.items)];
        const id = g.c.id, tot = p.todos.filter((t) => t.cat === id && !t.paused).length, dn = p.todos.filter((t) => t.cat === id && t.done).length;
        return [<div key={"h" + id} className="cat-h">{fbtn(id)}<h2><button className="back" data-tcat={id} style={{ padding: 0, font: "inherit", color: "inherit", textTransform: "inherit", letterSpacing: "inherit" } as React.CSSProperties}>{tr(`${g.c.name} ›`)}</button></h2>{cnt(id, g.items.length)}<span className="small muted">{`${dn}/${tot}`}</span><div className="cat-prog"><i style={prog(dn, tot)}></i></div></div>, body(id, g.items)];
      })}
    </>;
  }
  if (open.length) return <div className="card" data-group={cc}>{open.map(row)}</div>;
  const cat = cats.find((c) => c.id === cc);
  const msg = p.search ? "Aucune tâche à faire ne correspond." : p.todos.filter((t) => cc === "all" || (cc === "none" ? !(t.cat && x.catOf(t.cat)) : t.cat === cc)).some((t) => t.done) ? "Tout est réalisé. Bravo !" : cat ? "Aucune tâche dans cette catégorie. Ajoute-en une ci-dessus." : "Aucune tâche. Ajoute-en une ci-dessus.";
  return <div className="card"><div className="empty">{tr(msg)}</div></div>;
}

/** Réalisées en liste : année › mois › semaine › jour, du plus récent au plus ancien. */
function DoneGroups({ p, x }: { p: TodosProps; x: RowCtx }) {
  const { tr, L, MOL, MO, DOWL, lang } = p.i18n, mlow = (i: number) => lang === "en" ? MOL[i] : MOL[i].toLowerCase();
  const out: ReactNode[] = [];
  let Y: number | null = null, M: number | null = null, W: string | null = null, D: string | null = null, card: ReactNode[] | null = null;
  const close = () => { if (card) { out.push(<div key={"c" + out.length} className="card" style={{ marginBottom: "8px" }}>{card}</div>); card = null; } };
  for (const t of p.done) {
    const d = doneDate(t), y = d.getFullYear(), m = d.getMonth(), mon = mondayOf(d), w = iso(mon), dk = iso(d);
    if (y !== Y) { close(); out.push(<div key={"y" + y} className="grp-y">{y}</div>); Y = y; M = null; }
    if (m !== M) { close(); out.push(<div key={`m${y}-${m}`} className="grp-m">{tr(MOL[m])}</div>); M = m; W = null; }
    if (w !== W) {
      close(); const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
      out.push(<div key={"w" + w} className="grp-w">{tr(`${L("Semaine du")} ${mon.getDate()}${mon.getMonth() !== sun.getMonth() ? " " + MO[mon.getMonth()] : ""} ${L("au")} ${sun.getDate()} ${MO[sun.getMonth()]}`)}</div>); W = w; D = null;
    }
    if (dk !== D) { if (!card) card = []; card.push(<div key={"d" + dk} className="grp-d">{tr(`${DOWL[d.getDay()]} ${d.getDate()} ${mlow(m)}`)}</div>); D = dk; }
    card!.push(<TodoRow key={t.id} t={t} x={x} />);
  }
  close();
  return <>{out}</>;
}

/** Réalisées en calendrier : chaque jour montre combien de tâches ont été faites ; toucher un jour affiche sa liste. */
function DoneCal({ p, x }: { p: TodosProps; x: RowCtx }) {
  const { tr, L, MOL, DOWL, lang } = p.i18n, mlow = (i: number) => lang === "en" ? MOL[i] : MOL[i].toLowerCase();
  const byDay: Record<string, Todo[]> = {};
  p.done.forEach((t) => { const k = iso(doneDate(t)); (byDay[k] = byDay[k] || []).push(t); });
  const now = new Date(), cur = now.getFullYear() * 12 + now.getMonth(), dm = p.dcMonth, y = Math.floor(dm / 12), m = dm % 12, tk = iso(now);
  const pre = `${y}-${two(m + 1)}`, inM = Object.entries(byDay).filter(([k]) => k.startsWith(pre));
  const max = Math.max(1, ...inM.map(([, v]) => v.length)), monthN = inM.reduce((a, [, v]) => a + v.length, 0);
  const sel = p.dcSel ? byDay[p.dcSel] : undefined, sd = p.dcSel ? parse(p.dcSel) : null;
  return <>
    <div className="card dc">
      <div className="dc-top"><button type="button" className="mini" data-dcm={dm - 1} aria-label={tr("Mois précédent")}>‹</button><b>{tr(`${L(MOL[m])} ${y}`)}</b><button type="button" className="mini" data-dcm={dm + 1} disabled={dm >= cur} aria-label={tr("Mois suivant")}>›</button></div>
      <div className="small muted" style={{ textAlign: "center", margin: "-2px 0 8px" }}>{tr(`${monthN} ${L(monthN > 1 ? "tâches réalisées ce mois-ci" : "tâche réalisée ce mois-ci")}`)}</div>
      <div className="dc-g">
        {[...(({ fr: "LMMJVSD", en: "MTWTFSS", nl: "MDWDVZZ" } as Record<string, string>)[lang] || "LMMJVSD")].map((l, i) => <i key={"l" + i}>{tr(l)}</i>)}
        {monthCells(y, m).map((c, i) => {
          if (!c) return <span key={"o" + i}></span>;
          const n = (byDay[c.k] || []).length, lv = n ? Math.ceil(n / max * 4) : 0;
          return <button key={c.k} type="button" className={`dc-d lv${lv} ${c.k === tk ? "td" : ""}`} data-dcday={c.k} aria-pressed={p.dcSel === c.k} disabled={!n} aria-label={tr(`${c.d} ${MOL[m]} : ${n}`)}><span>{c.d}</span>{n ? <b>{n}</b> : null}</button>;
        })}
      </div>
    </div>
    {sel && sd ? <><div className="grp-d" style={{ margin: "10px 4px 6px" }}>{tr(`${DOWL[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())} · ${sel.length} ${L(sel.length > 1 ? "tâches" : "tâche")}`)}</div><div className="card">{sel.map((t) => <TodoRow key={t.id} t={t} x={x} />)}</div></>
      : <p className="small muted" style={{ textAlign: "center", margin: "10px 0 0" }}>{tr(L("Touche un jour pour voir ce que tu as fait."))}</p>}
  </>;
}

export function TodoPaused({ p, x }: { p: TodosProps; x: RowCtx }) {
  const open = p.search || p.view.pausedOpen;
  return open ? <>{p.paused.map((t) => <TodoRow key={t.id} t={t} x={x} />)}</> : null;
}
export function TodoDone({ p, x }: { p: TodosProps; x: RowCtx }) {
  const open = p.search || p.view.doneOpen;
  if (!open) return null;
  return p.view.doneCal && !p.search ? <DoneCal p={p} x={x} /> : <DoneGroups p={p} x={x} />;
}

export function rowCtx(p: TodosProps): RowCtx {
  const m = new Map(p.cats.map((c) => [c.id, c]));
  return { p, catOf: (id) => id ? m.get(id) : undefined };
}
