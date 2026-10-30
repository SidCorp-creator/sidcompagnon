// Focus : temps de travail concentré du jour et des 7 derniers jours (ticket #3, v51). Même rendu que renderPomoStats.
import type { I18n } from "./types";
import { hm } from "./format";

export function PomoStats(p: { todayMin: number; weekMin: number; i18n: I18n }) {
  const { L } = p.i18n;
  return <>
    <div className="row"><div className="grow">{L("Travail concentré aujourd'hui")}</div><b>{hm(p.todayMin)}</b></div>
    <div className="row"><div className="grow">{L("Sur les 7 derniers jours")}</div><b>{hm(p.weekMin)}</b></div>
  </>;
}
