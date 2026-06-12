export type SubActivityKey = string;

export type SubActivity = {
  key: SubActivityKey;
  label: string;
};

export type MainCategory = {
  id: string;
  label: string;
  /** Pályázati díj kreditben (kategóriánként változik). */
  bidCreditCost: number;
  subActivities: SubActivity[];
};

/** Ismeretlen / régi kategória esetén. */
export const DEFAULT_BID_CREDIT_COST = 3;

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "kertgondozas",
    label: "Kertgondozás & Zöldterület",
    bidCreditCost: 2,
    subActivities: [
      { key: "funyiras", label: "Fűnyírás" },
      { key: "sovenynyiras", label: "Sövénynyírás" },
      { key: "favagas_fametszes", label: "Favágás / fametszés" },
      { key: "asas_gyomtalanitas", label: "Ásás / gyomtalanítás" },
      { key: "fuvesites", label: "Füvesítés" },
      { key: "ontozorendszer", label: "Öntözőrendszer" },
      { key: "kerti_hulladek_elszallitas", label: "Kerti hulladék elszállítás" },
      { key: "egyeb_kert", label: "Egyéb kerti munka" },
    ],
  },
  {
    id: "festes_dekor",
    label: "Festés, Dekoratív munkák",
    bidCreditCost: 3,
    subActivities: [
      { key: "szobafestes", label: "Szobafestés" },
      { key: "glett", label: "Glettelés" },
      { key: "tapetazas", label: "Tapétázás" },
      { key: "mazolas_kerites_ajto", label: "Mázolás (kerítés, ajtó)" },
      { key: "peneszmentesites", label: "Penészmentesítés" },
      { key: "egyeb_festes", label: "Egyéb festés" },
    ],
  },
  {
    id: "epitoipar",
    label: "Építőipari kisebb munkák (Kőműves & Burkolás)",
    bidCreditCost: 5,
    subActivities: [
      { key: "csempezes_jarolapozas", label: "Csempézés / járólapozás" },
      { key: "gipszkartonozas", label: "Gipszkartonozás" },
      { key: "kisebb_falazas_vakolas", label: "Kisebb falazás / vakolás" },
      { key: "betonozas_javitas", label: "Betonozás / javítás" },
      { key: "nyilaszaromoli_javitas", label: "Nyílászáró-mű javítás" },
      { key: "egyeb_komuves", label: "Egyéb kőműves munka" },
    ],
  },
  {
    id: "villanyszereles",
    label: "Villanyszerelés",
    bidCreditCost: 3,
    subActivities: [
      { key: "lampa_bekotes_felszereles", label: "Lámpa bekötés / felszerelés" },
      { key: "kapcsolo_konnektor_csere", label: "Kapcsoló / konnektor csere" },
      { key: "biztositek_tabla_csere", label: "Biztosítéktábla csere" },
      { key: "hibakereses_zarlat", label: "Hibakeresés / zárlat" },
      { key: "uj_vezetek_behuzas", label: "Új vezeték behúzás" },
      { key: "egyeb_villany", label: "Egyéb villanyszerelés" },
    ],
  },
  {
    id: "viz_gaz",
    label: "Víz- és Gázszerelés, Szaniterek",
    bidCreditCost: 3,
    subActivities: [
      { key: "csaptelep_szifon_csere", label: "Csaptelep / szifon csere" },
      { key: "zuhanyfal_beszereles", label: "Zuhanyfal beszerelés" },
      { key: "szilikon_megujitas_szigeteles", label: "Szilikon / megújítás / szigetelés" },
      { key: "dugulaselharitas", label: "Duguláselhárítás" },
      { key: "mosogep_bekotes", label: "Mosógép bekötés" },
      { key: "wc_csere", label: "WC csere" },
      { key: "egyeb_viz", label: "Egyéb víz-gáz munka" },
    ],
  },
  {
    id: "klima",
    label: "Klíma & Légtechnika",
    bidCreditCost: 3,
    subActivities: [
      { key: "klimaszereles_uj", label: "Klímaszerelés (új)" },
      { key: "klimatisztitas_fertotlenites", label: "Klímatisztítás / fertőtlenítés" },
      { key: "klima_gaztoltes_javitas", label: "Klíma gáztöltés / javítás" },
      { key: "egyeb_klima", label: "Egyéb klíma munka" },
    ],
  },
  {
    id: "asztalos",
    label: "Asztalos munkák",
    bidCreditCost: 3,
    subActivities: [
      { key: "egyedi_butor_keszites", label: "Egyedi bútor készítés" },
      { key: "konyhabutor_beepites", label: "Konyhabútor beépítés" },
      { key: "munkalap_csere", label: "Munkalap csere" },
      { key: "nyilaszarok_passzitasa", label: "Nyílászárók passzítása" },
      { key: "parkettazas_laminat", label: "Parkettázás / laminát" },
      { key: "egyeb_asztalos", label: "Egyéb asztalos munka" },
    ],
  },
  {
    id: "lakatos",
    label: "Épületlakatos munkák",
    bidCreditCost: 5,
    subActivities: [
      { key: "elotetok_keszitese", label: "Előtetők készítése" },
      { key: "keritesek_kapuk_gyartasa", label: "Kerítések / kapuk gyártása" },
      { key: "korlatok_keszitese", label: "Korlátok készítése" },
      { key: "biztonsagi_racsok", label: "Biztonsági rácsok" },
      { key: "hegesztesi_munkak", label: "Hegesztési munkák" },
      { key: "egyeb_lakatos", label: "Egyéb lakatos munka" },
    ],
  },
  {
    id: "butorosszeszereles",
    label: "Bútorösszeszerelés",
    bidCreditCost: 1.5,
    subActivities: [
      { key: "sima_butorosszeszereles", label: "Sima bútorösszeszerelés" },
      {
        key: "komplett_aruhazi_elhozatal_szallitas_szereles",
        label: "Komplett áruházi elhozatal + szállítás + szerelés",
      },
      { key: "egyeb_butor", label: "Egyéb bútor munka" },
    ],
  },
  {
    id: "szallitas",
    label: "Szállítás & Költöztetés",
    bidCreditCost: 2,
    subActivities: [
      { key: "koltoztetes_rakodokkal", label: "Költöztetés rakodókkal" },
      { key: "tehertaxi_anyag_szallitas", label: "Tehertaxi / anyag szállítás" },
      { key: "lomtalanitas_hagyatek", label: "Lomtalanítás / hagyaték" },
      { key: "sitt_elszallitas", label: "Sitt elszállítás" },
      { key: "egyeb_szallitas", label: "Egyéb szállítás" },
    ],
  },
  {
    id: "takaritas",
    label: "Takarítás",
    bidCreditCost: 1.5,
    subActivities: [
      { key: "takaritas", label: "Takarítás" },
      { key: "ablak_kirakat_tisztitas", label: "Ablak / kirakat tisztítás" },
      { key: "egyeb_takaritas", label: "Egyéb takarítás" },
    ],
  },
  {
    id: "ezermester",
    label: "Ház körüli ezermester (Handyman)",
    bidCreditCost: 1.5,
    subActivities: [
      { key: "karnis_fuggonysin", label: "Karnis / függönysín" },
      { key: "kep_tukor_polc_furas", label: "Kép / tükör / polc fúrás" },
      { key: "tv_fali_konzol", label: "TV fali konzol" },
      { key: "kilincs_zar_csere", label: "Kilincs / zár csere" },
      { key: "kisebb_esztetikai_javitasok", label: "Kisebb esztétikai javítások" },
      { key: "egyeb_ezermester", label: "Egyéb ezermester munka" },
    ],
  },
  {
    id: "egyeb",
    label: "Egyéb",
    bidCreditCost: 2,
    subActivities: [
      {
        key: "egyeb_altalanos",
        label: "Egyéb / nem találom a megfelelő kategóriát",
      },
    ],
  },
];

/** Fő „Egyéb” kategória – szélesebb értesítés a zónában. */
export const OTHER_MAIN_CATEGORY_ID = "egyeb" as const;

export const MAIN_CATEGORY_IDS = MAIN_CATEGORIES.map((c) => c.id) as readonly string[];

export type MainCategoryId = (typeof MAIN_CATEGORY_IDS)[number];

const mainById = new Map(MAIN_CATEGORIES.map((c) => [c.id, c]));
const subByKey = new Map<string, { mainId: string; label: string }>();

for (const main of MAIN_CATEGORIES) {
  for (const sub of main.subActivities) {
    subByKey.set(sub.key, { mainId: main.id, label: sub.label });
  }
}

/** Régi lapos kategórianevek → új főkategória ID */
export const LEGACY_CATEGORY_TO_MAIN_ID: Record<string, MainCategoryId> = {
  Villanyszerelés: "villanyszereles",
  "Vízvezetékszerelés": "viz_gaz",
  Bútorösszeszerelés: "butorosszeszereles",
  "Kisebb fúrás/polcozás": "ezermester",
  "Kerti munka / fűnyírás": "kertgondozas",
  "Szállítás / költöztetés": "szallitas",
};

export function getMainCategory(id: string): MainCategory | undefined {
  return mainById.get(id);
}

export function getMainCategoryLabel(id: string): string {
  return mainById.get(id)?.label ?? id;
}

export function getSubActivityLabel(key: string): string {
  return subByKey.get(key)?.label ?? key;
}

export function isValidMainCategoryId(id: string): id is MainCategoryId {
  return mainById.has(id);
}

export function isValidSubActivityKey(key: string): boolean {
  return subByKey.has(key);
}

export function getMainCategoryIdForSub(key: string): string | undefined {
  return subByKey.get(key)?.mainId;
}

export function getSubActivitiesForMain(mainId: string): SubActivity[] {
  return mainById.get(mainId)?.subActivities ?? [];
}

export function normalizeMainCategoryId(value: string): string | null {
  const trimmed = value.trim();
  if (isValidMainCategoryId(trimmed)) {
    return trimmed;
  }
  return LEGACY_CATEGORY_TO_MAIN_ID[trimmed] ?? null;
}

export function subCategoriesOverlap(
  craftsmanSubs: string[],
  jobSubs: string[],
): boolean {
  if (!craftsmanSubs.length || !jobSubs.length) {
    return false;
  }
  const jobSet = new Set(jobSubs);
  return craftsmanSubs.some((sub) => jobSet.has(sub));
}

/** Al-tevékenység „Egyéb” jelölés (pl. egyeb_villany). */
export function isOtherSubCategoryKey(key: string): boolean {
  return key === "egyeb_altalanos" || key.startsWith("egyeb_");
}

/** Egyéb hirdetés: minden, a zónában lévő fusizót érint. */
export function isBroadcastJobCategory(
  category: string,
  subCategories: string[] | null | undefined,
): boolean {
  if (category === OTHER_MAIN_CATEGORY_ID) {
    return true;
  }
  return (subCategories ?? []).some(isOtherSubCategoryKey);
}

/** Minden egyeb_* al-tevékenység kulcs (DB szűréshez). */
export function getBroadcastSubCategoryKeys(): string[] {
  const keys = new Set<string>();
  for (const main of MAIN_CATEGORIES) {
    for (const sub of main.subActivities) {
      if (isOtherSubCategoryKey(sub.key)) {
        keys.add(sub.key);
      }
    }
  }
  return [...keys];
}

export function craftsmanMatchesJobSkills(
  craftsmanSubs: string[],
  craftsmanProfessions: string[],
  jobCategory: string,
  jobSubs: string[],
): boolean {
  if (isBroadcastJobCategory(jobCategory, jobSubs)) {
    return true;
  }

  if (craftsmanSubs.length > 0 && jobSubs.length > 0) {
    return subCategoriesOverlap(craftsmanSubs, jobSubs);
  }

  return craftsmanProfessions.includes(jobCategory);
}

export function formatSubCategoryLabels(keys: string[]): string[] {
  return keys.map(getSubActivityLabel);
}

export function getBidCreditCostForCategory(mainCategoryId: string): number {
  const normalized = normalizeMainCategoryId(mainCategoryId) ?? mainCategoryId;
  return mainById.get(normalized)?.bidCreditCost ?? DEFAULT_BID_CREDIT_COST;
}

export function getBidCreditCostRange(): { min: number; max: number } {
  const costs = MAIN_CATEGORIES.map((c) => c.bidCreditCost);
  return { min: Math.min(...costs), max: Math.max(...costs) };
}

/** Kategóriák csoportosítva pályázati díj szerint (növekvő sorrend). */
export function getCategoriesGroupedByBidCost(): {
  cost: number;
  categories: MainCategory[];
}[] {
  const byCost = new Map<number, MainCategory[]>();

  for (const category of MAIN_CATEGORIES) {
    const list = byCost.get(category.bidCreditCost) ?? [];
    list.push(category);
    byCost.set(category.bidCreditCost, list);
  }

  return [...byCost.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cost, categories]) => ({ cost, categories }));
}
