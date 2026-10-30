// Premier écran migré (ticket #3) : le calendrier Semaine / Mois / Année de la Nutrition (v47, #16).
// Même rendu que l'ancienne fonction renderNuCal de site/app.js (mêmes classes, mêmes data-*) :
// les clics restent gérés par l'app actuelle, ce composant ne fait que calculer et afficher.
import type { I18n, NuRange } from "./types";
import { addDays, iso, monthCells, parse } from "./dates";

export interface NuCalProps {
  range: NuRange;
  year: number; // année affichée (vues mois et année)
  month: number; // 0–11 (vue mois)
  weekStart: string; // lundi de la semaine affichée (vue semaine)
  today: string; // AAAA-MM-JJ
  selected: string; // jour ouvert dans « Ma journée »
  byDay: Record<string, number>; // kcal notées par jour
  target: (day: string) => number; // objectif kcal du jour
  i18n: I18n;
}

type St = "" | "ok" | "under" | "over";
const r0 = (x: number) => Math.round(x);
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function dayState(byDay: Record<string, number>, target: (d: string) => number, k: string): St {
  if (byDay[k] == null) return "";
  const r = byDay[k] / (target(k) || 1);
  return r > 1.05 ? "over" : r >= 0.9 ? "ok" : "under";
}

export function NutritionCalendar(p: NuCalProps) {
  const { L, MOL, MO, DOWL } = p.i18n, st = (k: string) => dayState(p.byDay, p.target, k);
  let tot = 0, nd = 0, title = "", next = "", body: JSX.Element;
  const add = (k: string) => { if (p.byDay[k] != null) { tot += p.byDay[k]; nd++; } };

  if (p.range === "week") {
    const m = parse(p.weekStart), e = parse(addDays(p.weekStart, 6));
    title = `${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]} ${e.getFullYear()}`;
    next = addDays(p.weekStart, 7);
    const days = Array.from({ length: 7 }, (_, i) => addDays(p.weekStart, i));
    days.forEach(add);
    body = <div className="nwk">{days.map((k) => {
      const d = parse(k), v = p.byDay[k], tg = p.target(k) || 0;
      return <button key={k} type="button" className={cx("nwk-row", k === p.selected && "on", st(k))} data-nuday={k} disabled={k > p.today}>
        <span className="nwk-d"><b>{DOWL[d.getDay()]}</b><small>{d.getDate()} {MO[d.getMonth()]}</small></span>
        <span className="nwk-bar"><i style={{ width: `${tg && v ? Math.min(100, v / tg * 100) : 0}%` }}></i></span>
        <span className="nwk-k">{v != null ? r0(v) : "–"}{v != null && tg ? <small> / {tg}</small> : null}</span>
      </button>;
    })}</div>;
  } else if (p.range === "month") {
    title = `${MOL[p.month]} ${p.year}`;
    next = iso(new Date(p.year, p.month + 1, 1));
    const cells = monthCells(p.year, p.month);
    cells.forEach((c) => c && st(c.k) && add(c.k));
    body = <>
      <div className="cal-grid cal-dow">{[1, 2, 3, 4, 5, 6, 0].map((i) => <span key={i}>{String(DOWL[i] || "").slice(0, 1).toUpperCase()}</span>)}</div>
      <div className="cal-grid nu-mgrid">{cells.map((c, i) => {
        if (!c) return <span key={"o" + i} className="day out"></span>;
        const s = st(c.k);
        return <button key={c.k} type="button" className={cx("day", c.k === p.today && "today", c.k === p.selected && "sel", c.k < p.today && "past")}
          data-nuday={c.k} disabled={c.k > p.today} aria-label={`${c.d} ${MOL[p.month]}${s ? ` · ${r0(p.byDay[c.k])} kcal` : ""}`}>
          <span className="num">{c.d}</span>
          <span className="marks">{s ? <span className="dots"><i className={`nu-st ${s}`}></i></span> : null}</span>
        </button>;
      })}</div>
    </>;
  } else {
    title = String(p.year);
    next = iso(new Date(p.year + 1, 0, 1));
    Object.keys(p.byDay).forEach((k) => k.startsWith(p.year + "-") && add(k));
    const now = parse(p.today);
    body = <>
      <div className="yr-grid nu-ygrid">{MOL.map((name, m) =>
        <button key={m} type="button" className={cx("ym", p.year === now.getFullYear() && m === now.getMonth() && "cur")} data-ym={m} aria-label={`${name} ${p.year}`}>
          <b>{name}</b>
          <div className="ym-g">{monthCells(p.year, m).map((c, i) => {
            if (!c) return <i key={"o" + i}></i>;
            const s = st(c.k);
            return <i key={c.k} className={cx(c.k === p.today ? "td" : s && `ev nu-${s}`, c.k < p.today && "past")}>{c.d}</i>;
          })}</div>
        </button>)}</div>
      <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>{L("Touche un mois pour l'ouvrir.")}</p>
    </>;
  }

  const legend = p.range !== "year" ? <div className="nu-leg small muted">
    <span><i className="nu-st ok"></i>{L("Dans l'objectif")}</span>
    <span><i className="nu-st under"></i>{L("En dessous")}</span>
    <span><i className="nu-st over"></i>{L("Au-dessus")}</span>
  </div> : null;
  const summary = <div className="small muted nu-cal-sum">{nd
    ? `${nd} ${L(nd > 1 ? "jours notés" : "jour noté")} · ${L("moyenne")} ${r0(tot / nd)} kcal`
    : L("Aucun repas noté sur cette période.")}</div>;
  const names: Record<NuRange, string> = { week: "Semaine", month: "Mois", year: "Année" };

  return <>
    <div className="seg nu-cal-seg" role="group" aria-label={L("Vue")}>{(["week", "month", "year"] as NuRange[]).map((m) =>
      <button key={m} type="button" data-nurange={m} aria-pressed={m === p.range}>{L(names[m])}</button>)}</div>
    <div className="cal-head">
      <button type="button" className="cal-nav" data-nurn="-1" aria-label={L("Période précédente")}>‹</button>
      <b className="nu-cal-t">{title}</b>
      <button type="button" className="cal-nav" data-nurn="1" aria-label={L("Période suivante")} disabled={next > p.today}>›</button>
    </div>
    {body}
    {legend}
    {summary}
    <button type="button" className="linkbtn nu-cal-x" data-nurange="">{L("Fermer le calendrier")}</button>
  </>;
}
