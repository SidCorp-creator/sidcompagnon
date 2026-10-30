// Types des données de Sid'compagnon (le JSON de user_data.data), complétés au fil de la migration.

/** Un aliment noté dans la journée nutrition (data.nutri.log). */
export interface NuLogItem {
  id: string;
  day: string; // AAAA-MM-JJ
  at?: string; // ISO
  grp?: string;
  gname?: string;
  name: string;
  qty?: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  upd?: number;
}

/** Textes et noms traduits fournis par l'app (L(), mois, jours). */
export interface I18n {
  L: (fr: string) => string;
  MOL: string[]; // mois en toutes lettres
  MO: string[]; // mois abrégés
  DOWL: string[]; // jours (dimanche en premier)
  DOW?: string[]; // jours, forme courte de l'agenda (dimanche en premier)
  lang?: string; // fr, en ou nl
}

export type NuRange = "week" | "month" | "year";

/** Une journée des graphiques (même forme que grData() de site/app.js). */
export interface GrDay {
  k: string; // AAAA-MM-JJ
  has: boolean; // au moins un repas noté
  kcal: number;
  p: number;
  c: number;
  f: number;
  t: number; // objectif kcal du jour (0 sans objectif)
  kg: number | null; // poids noté ce jour-là
}

/** Infobulle des graphiques (gérée par l'app : élément #grTip). */
export interface Tip {
  show: (ev: PointerEvent, html: string) => void;
  hide: () => void;
}
