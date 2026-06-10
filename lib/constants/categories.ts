export type SubActivityKey = string;

export type SubActivity = {
  key: SubActivityKey;
  label: string;
};

export type MainCategory = {
  id: string;
  label: string;
  subActivities: SubActivity[];
};

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "kertgondozas",
    label: "Kertgondozás & Zöldterület",
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
    subActivities: [
      { key: "takaritas", label: "Takarítás" },
      { key: "ablak_kirakat_tisztitas", label: "Ablak / kirakat tisztítás" },
      { key: "egyeb_takaritas", label: "Egyéb takarítás" },
    ],
  },
  {
    id: "ezermester",
    label: "Ház körüli ezermester (Handyman)",
    subActivities: [
      { key: "karnis_fuggonysin", label: "Karnis / függönysín" },
      { key: "kep_tukor_polc_furas", label: "Kép / tükör / polc fúrás" },
      { key: "tv_fali_konzol", label: "TV fali konzol" },
      { key: "kilincs_zar_csere", label: "Kilincs / zár csere" },
      { key: "kisebb_esztetikai_javitasok", label: "Kisebb esztétikai javítások" },
      { key: "egyeb_ezermester", label: "Egyéb ezermester munka" },
    ],
  },
];

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

export function formatSubCategoryLabels(keys: string[]): string[] {
  return keys.map(getSubActivityLabel);
}
