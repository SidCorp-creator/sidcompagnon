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
}

export type NuRange = "week" | "month" | "year";
