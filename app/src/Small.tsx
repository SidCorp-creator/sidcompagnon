// Petits blocs migrés en v52 (ticket #3) : barre « Mon objectif » de la Musculation, barres des macros de la Nutrition.
import type { I18n } from "./types";
import { fmtFull } from "./format";

export function MuGoal({ keys, goal, names, i18n }: { keys: string[]; goal: string; names: Record<string, string>; i18n: I18n }) {
  const { L } = i18n;
  return <>
    <span className="eyebrow">{L("Mon objectif")}</span>
    <div className="seg mu-goal-seg" role="group" aria-label={L("Mon objectif")} style={{ gridTemplateColumns: `repeat(${keys.length},minmax(0,1fr))` }}>
      {keys.map((k) => <button key={k} type="button" data-mugoal={k} aria-pressed={k === goal}>{L(names[k])}</button>)}
    </div>
    <div className="small muted">{L("Les séries et répétitions conseillées de chaque exercice suivent cet objectif.")}</div>
  </>;
}

export interface MacroRow { k: string; label: string; c: string; val: number; target: number }
export function NuMacros({ rows, i18n }: { rows: MacroRow[]; i18n: I18n }) {
  const { L } = i18n;
  return <>{rows.map((m) => <div key={m.k} className="nu-m">
    <div className="top"><b><span className="mdot" style={{ "--c": `var(${m.c})` } as React.CSSProperties}></span>{L(m.label)}</b><span>{`${fmtFull(m.val,i18n.lang||"fr")} / ${fmtFull(m.target,i18n.lang||"fr")}\u202fg`}</span></div>
    <div className="bar"><i style={{ "--c": `var(${m.c})`, width: `${Math.min(100, m.target ? m.val / m.target * 100 : 0)}%` } as React.CSSProperties}></i></div>
  </div>)}</>;
}

// v55 : Focus : boutons de durée totale et frise travail / pause (renderSetup, planBar de site/app.js)
export function PomoPresets({ presets, total, labels }: { presets: number[]; total: number; labels: string[] }) {
  return <>{presets.map((m, i) => <button key={m} className="preset notr" data-total={m} aria-pressed={total === m}>{labels[i]}</button>)}</>;
}
export function PlanBar({ segs, doneIdx, into=0 }: { segs: { t: string; d: number }[]; doneIdx: number; into?:number }) {
  const tot = segs.reduce((a, s) => a + s.d, 0);
  return <>{segs.map((s, i) => <i key={i} className={`${s.t === "w" ? "w" : "b"} ${i < doneIdx ? "past" : ""}`} style={{ flex: s.t==="b"?"0 0 4px":s.d / tot }}>{s.t==="w"?<b style={{width:`${i<doneIdx?100:i===doneIdx?Math.min(1,into)*100:0}%`}}/>:null}</i>)}</>;
}
