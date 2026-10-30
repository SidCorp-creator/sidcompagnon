// Petits blocs migrés en v52 (ticket #3) : barre « Mon objectif » de la Musculation, barres des macros de la Nutrition.
import type { I18n } from "./types";
import { r0 } from "./format";

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
    <div className="top"><b><span className="mdot" style={{ "--c": `var(${m.c})` } as React.CSSProperties}></span>{L(m.label)}</b><span>{`${r0(m.val)} / ${m.target} g`}</span></div>
    <div className="bar"><i style={{ "--c": `var(${m.c})`, width: `${Math.min(100, m.target ? m.val / m.target * 100 : 0)}%` } as React.CSSProperties}></i></div>
  </div>)}</>;
}
