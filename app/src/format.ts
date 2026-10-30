// Petits formats partagés (mêmes règles que site/app.js : fmtN, fmtFull, dLbl, hm, niceStep, niceMax).
import { parse } from "./dates";

export const r0 = (x: number) => Math.round(+x || 0);
export const r1 = (x: number) => Math.round((+x || 0) * 10) / 10;
const sep = (lang: string) => (lang === "en" ? "." : ",");

export function niceStep(v: number): number {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
export function niceMax(v: number): number {
  const st = niceStep(v / 4);
  return Math.max(st, Math.ceil(v / st) * st);
}
export const fmtFull = (v: number, lang: string) =>
  Math.round(v).toLocaleString(lang === "en" ? "en-US" : lang === "nl" ? "nl-NL" : "fr-FR");
export const fmtN = (v: number, lang: string) => {
  v = Math.round(v * 10) / 10;
  return v >= 1000 ? (Math.round(v / 100) / 10 + "K").replace(".", sep(lang)) : String(v).replace(".", sep(lang));
};
/** Jour court (12/3) ou long (jeudi 12 mars). */
export const dLbl = (k: string, long: boolean, DOW: string[], MO: string[]) => {
  const d = parse(k);
  return long ? `${DOW[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}` : `${d.getDate()}/${d.getMonth() + 1}`;
};
/** Durée en minutes : « 45 min », « 1 h », « 1 h 05 ». */
export const hm = (m: number) => {
  m = Math.round(m);
  const h = Math.floor(m / 60), r = m % 60;
  return h ? `${h} h${r ? " " + String(r).padStart(2, "0") : ""}` : `${r} min`;
};
export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
