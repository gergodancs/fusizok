export const JOB_CATEGORIES = [
  "Villanyszerelés",
  "Vízvezetékszerelés",
  "Bútorösszeszerelés",
  "Kisebb fúrás/polcozás",
  "Kerti munka / fűnyírás",
  "Szállítás / költöztetés",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
