// Graphiques de sid'fit (ticket #3, v51) : courbes (macros, poids), colonnes des calories, légendes, tableau.
// Même dessin que lineChart / colChart / le tableau de site/app.js (mêmes classes, mêmes coordonnées).
import { useRef } from "react";
import type { GrDay, I18n, Tip } from "./types";
import { dLbl, esc, fmtFull, fmtN, niceMax, niceStep, r0 } from "./format";

type Base = { i18n: I18n & { DOW: string[]; lang: string } };
export interface Serie { label: string; c: string; vals: (number | null)[] }
export interface LineOpt { zero?: boolean; dots?: boolean; unit?: string; ref?: { v: number; label: string } | null; empty?: string; aria?: string }

export function LineChart(p: Base & { width: number; days: string[]; series: Serie[]; opt: LineOpt; tip: Tip }) {
  const { L, DOW, MO, lang } = p.i18n, { days, series, opt } = p;
  const svgRef = useRef<SVGSVGElement>(null), xlRef = useRef<SVGLineElement>(null);
  const W = Math.max(280, p.width || 320), H = 170, ml = 34, mr = 14, mt = 12, mb = 24, pw = W - ml - mr, ph = H - mt - mb;
  const all = series.flatMap((s) => s.vals.filter((v): v is number => v != null));
  if (opt.ref) all.push(opt.ref.v);
  if (!series.some((s) => s.vals.some((v) => v != null))) return <div className="gr-empty">{L(opt.empty || "Pas encore de données sur cette période.")}</div>;
  let lo = opt.zero ? 0 : Math.min(...all), hi = Math.max(...all);
  if (!opt.zero) { const pad = Math.max(1, (hi - lo) * 0.15); lo = Math.floor(lo - pad); hi = hi + pad; }
  const top = opt.zero ? niceMax(hi) : Math.ceil(hi), step = opt.zero ? niceStep(hi / 4) : (top - lo) / 4;
  const X = (i: number) => ml + (days.length < 2 ? pw / 2 : i * pw / (days.length - 1)), Y = (v: number) => mt + ph - (v - lo) / (top - lo || 1) * ph;
  const grid: JSX.Element[] = [];
  for (let v = lo; v <= top + 1e-9; v += step) {
    const y = Y(v);
    grid.push(<line key={"g" + v} className="grid" x1={ml} x2={W - mr} y1={y} y2={y} />, <text key={"t" + v} className="ax" x={ml - 6} y={y + 4} textAnchor="end">{fmtN(v, lang)}</text>);
  }
  const every = days.length > 10 ? 7 : 1;
  const xl = days.map((k, i) => (days.length - 1 - i) % every === 0 ? <text key={"x" + k} className="ax" x={X(i)} y={H - 6} textAnchor="middle">{dLbl(k, false, DOW, MO)}</text> : null);
  const move = (ev: React.PointerEvent) => {
    const svg = svgRef.current!, line = xlRef.current!, r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width;
    const i = Math.max(0, Math.min(days.length - 1, Math.round((x - ml) / (pw / Math.max(1, days.length - 1)))));
    line.setAttribute("x1", String(X(i))); line.setAttribute("x2", String(X(i))); line.setAttribute("visibility", "visible");
    const rows = series.map((s) => s.vals[i] == null ? "" : `<div><b>${fmtN(s.vals[i]!, lang)}${opt.unit || ""}</b> <span class="k" style="--c:var(${s.c})"></span>${esc(L(s.label))}</div>`).join("");
    p.tip.show(ev.nativeEvent, `<div style="opacity:.75;margin-bottom:2px">${dLbl(days[i], true, DOW, MO)}</div>${rows || L("Pas de données")}`);
  };
  return <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={opt.aria || ""} style={{ touchAction: "pan-y" }}
    onPointerMove={move} onPointerDown={move}
    onPointerLeave={(ev) => { if (ev.pointerType !== "touch") { p.tip.hide(); xlRef.current!.setAttribute("visibility", "hidden"); } }}>
    {grid}{xl}
    {opt.ref ? <>
      <line x1={ml} x2={W - mr} y1={Y(opt.ref.v)} y2={Y(opt.ref.v)} stroke="var(--muted)" strokeWidth="1" />
      <text className="lbl" x={W - mr} y={Y(opt.ref.v) - 5} textAnchor="end">{opt.ref.label}</text>
    </> : null}
    {series.map((s, si) => {
      let d = "", on = false;
      s.vals.forEach((v, i) => { if (v == null) { on = false; return; } d += (on ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); on = true; });
      return [<path key={"p" + si} d={d} fill="none" stroke={`var(${s.c})`} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />,
        ...s.vals.map((v, i) => v != null && (opt.dots || i === s.vals.length - 1 || s.vals[i + 1] == null && (i === 0 || s.vals[i - 1] == null))
          ? <circle key={"c" + si + "-" + i} cx={X(i)} cy={Y(v)} r="4" fill={`var(${s.c})`} stroke="var(--surface)" strokeWidth="2" /> : null)];
    })}
    <line ref={xlRef} className="gr-x" x1="0" x2="0" y1={mt} y2={mt + ph} stroke="var(--muted)" strokeWidth="1" visibility="hidden" />
    <rect className="gr-hit" x={ml} y="0" width={pw} height={H} fill="transparent" />
  </svg>;
}

// colonnes des calories : couleur d'état (dans l'objectif, pas assez, trop) + trait de l'objectif
export const KLAB: Record<"ok" | "low" | "high", [string, string, string]> = { ok: ["✓", "Dans l'objectif", "--st-good"], low: ["↓", "Pas assez", "--st-warn"], high: ["↑", "Trop", "--st-bad"] };
type KV = { k: number | null; t: number };
const KST = (v: KV) => v.k == null ? null : v.k < v.t * 0.9 ? "low" : v.k > v.t * 1.1 ? "high" : "ok";

export function ColChart(p: Base & { width: number; days: string[]; vals: KV[]; tip: Tip }) {
  const { L, DOW, MO, lang } = p.i18n, { days, vals } = p;
  if (!vals.some((v) => v.k != null)) return <div className="gr-empty">{L("Pas encore de données sur cette période.")}</div>;
  const W = Math.max(280, p.width || 320), H = 170, ml = 38, mr = 8, mt = 14, mb = 24, pw = W - ml - mr, ph = H - mt - mb, n = days.length, band = pw / n, bw = Math.min(24, band * 0.62);
  const top = niceMax(Math.max(...vals.map((v) => Math.max(v.k || 0, v.t || 0))) * 1.05), Y = (v: number) => mt + ph - v / top * ph;
  const kst = niceStep(top / 4), out: (JSX.Element | null)[] = [];
  for (let v = 0; v <= top + 1e-9; v += kst) {
    const y = Y(v);
    out.push(<line key={"g" + v} className="grid" x1={ml} x2={W - mr} y1={y} y2={y} />, <text key={"t" + v} className="ax" x={ml - 6} y={y + 4} textAnchor="end">{fmtN(v, lang)}</text>);
  }
  const every = n > 10 ? 7 : 1;
  vals.forEach((v, i) => {
    const cx = ml + band * i + band / 2;
    if ((n - 1 - i) % every === 0) out.push(<text key={"x" + i} className="ax" x={cx} y={H - 6} textAnchor="middle">{dLbl(days[i], false, DOW, MO)}</text>);
    if (v.k == null || v.k <= 0) return;
    const st = KST(v)!, y = Y(v.k), h = mt + ph - y, r = Math.min(4, h, bw / 2), x0 = cx - bw / 2;
    out.push(<path key={"b" + i} d={`M${x0} ${mt + ph}V${y + r}Q${x0} ${y} ${x0 + r} ${y}H${x0 + bw - r}Q${x0 + bw} ${y} ${x0 + bw} ${y + r}V${mt + ph}Z`} fill={`var(${KLAB[st][2]})`} />,
      <rect key={"h" + i} className="gr-bar" data-i={i} x={ml + band * i} y={mt} width={band} height={ph} fill="transparent" />);
  });
  const t = vals[vals.length - 1].t;
  if (t) {
    const y = Y(t);
    out.push(<line key="obj" x1={ml} x2={W - mr} y1={y} y2={y} stroke="var(--ink)" strokeWidth="1" opacity=".55" />,
      <text key="objt" className="lbl" x={W - mr} y={y - 5} textAnchor="end">{`${L("Objectif")} ${fmtFull(t, lang)} kcal`}</text>);
  }
  const move = (ev: React.PointerEvent) => {
    const b = (ev.target as Element).closest(".gr-bar") as SVGElement | null;
    if (!b) { p.tip.hide(); return; }
    const i = +(b.dataset.i || 0), v = vals[i], st = KLAB[KST(v)!];
    p.tip.show(ev.nativeEvent, `<div style="opacity:.75;margin-bottom:2px">${dLbl(days[i], true, DOW, MO)}</div><b>${r0(v.k!)} kcal</b> / ${r0(v.t)}<div>${st[0]} ${L(st[1])}</div>`);
  };
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={L("Calories par jour")} style={{ touchAction: "pan-y" }}
    onPointerMove={move} onPointerDown={move} onPointerLeave={(ev) => { if (ev.pointerType !== "touch") p.tip.hide(); }}>{out}</svg>;
}

export function MacroLegend(p: Base & { macros: { k: string; label: string; c: string; goal?: number }[] }) {
  const { L } = p.i18n;
  return <>{p.macros.map((m) => <span key={m.k}><i style={{ "--c": `var(${m.c})` } as React.CSSProperties}></i>{L(m.label)}{m.goal ? <>{" "}<span>({L("objectif")} {m.goal} g)</span></> : null}</span>)}</>;
}
export function KcalLegend(p: Base) {
  const { L } = p.i18n;
  return <>{Object.values(KLAB).map(([ic, l, v]) => <span key={v}><i className="box" style={{ "--c": `var(${v})` } as React.CSSProperties}></i>{ic} {L(l)}</span>)}</>;
}
export function GrTable(p: Base & { D: GrDay[] }) {
  const { L, DOW, MO, lang } = p.i18n, dash = "–";
  return <table className="gr-tbl"><thead><tr><th>{L("Jour")}</th><th>kcal</th><th>P</th><th>G</th><th>L</th><th>kg</th></tr></thead>
    <tbody>{p.D.slice().reverse().map((d) => <tr key={d.k}>
      <td>{dLbl(d.k, true, DOW, MO)}</td><td>{d.has ? r0(d.kcal) : dash}</td><td>{d.has ? r0(d.p) : dash}</td><td>{d.has ? r0(d.c) : dash}</td><td>{d.has ? r0(d.f) : dash}</td><td>{d.kg != null ? fmtN(d.kg, lang) : dash}</td>
    </tr>)}</tbody></table>;
}
