// Dates locales au format AAAA-MM-JJ (mêmes règles que iso() / parse() de site/app.js).
export const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parse = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s: string, n: number): string => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
/** Jours d'un mois, précédés des cases vides pour commencer un lundi. */
export function monthCells(y: number, m: number): (null | { k: string; d: number })[] {
  const lead = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
  const out: (null | { k: string; d: number })[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= n; d++) out.push({ k: iso(new Date(y, m, d)), d });
  return out;
}
