import type { PublicJobListing } from "@/lib/jobs/job-listing";
import type { PublicJobPreview } from "@/lib/jobs/job-listing";

export const PLACEHOLDER_JOB_ID_PREFIX = "pelda-";

export type PlaceholderPublicJob = PublicJobListing & {
  isPlaceholder: true;
};

export type PublicJobPreviewItem = PublicJobPreview & {
  isPlaceholder?: boolean;
};

const PLACEHOLDER_JOBS: PlaceholderPublicJob[] = [
  {
    id: "pelda-polc-furas-budapest",
    isPlaceholder: true,
    title: "Polcok felszerelése a nappaliban",
    description:
      "Három fa polcot kellene felszerelni betonfalra. A polcok és a csavarok megvannak, csak fúrás és szintezés kellene.",
    category: "ezermester",
    sub_categories: ["kep_tukor_polc_furas"],
    county: "Budapest",
    city: "Budapest XIII. kerület",
    required_completion_time: "1 héten belül",
    created_at: "2026-06-01T09:15:00.000Z",
    client_display_name: "Eszter",
    bid_count: 3,
    has_images: false,
  },
  {
    id: "pelda-funyiras-szekesfehervar",
    isPlaceholder: true,
    title: "Fűnyírás és sövénynyírás",
    description:
      "Kb. 250 m² gyepet kellene nyírni, plusz egy sövényt formázni az udvaron. Saját géppel is jó, ha van.",
    category: "kertgondozas",
    sub_categories: ["funyiras", "sovenynyiras"],
    county: "Fejér",
    city: "Székesfehérvár",
    required_completion_time: "2 héten belül",
    created_at: "2026-06-02T11:30:00.000Z",
    client_display_name: "Gábor",
    bid_count: 2,
    has_images: false,
  },
  {
    id: "pelda-lampa-debrecen",
    isPlaceholder: true,
    title: "Mennyezeti lámpa felszerelése",
    description:
      "Új mennyezeti lámpatest bekötése a nappaliban. A régi lámpa már le van szerelve, vezetékek rendben.",
    category: "villanyszereles",
    sub_categories: ["lampa_bekotes_felszereles"],
    county: "Hajdú-Bihar",
    city: "Debrecen",
    required_completion_time: "3 napon belül",
    created_at: "2026-06-03T08:00:00.000Z",
    client_display_name: "Katalin",
    bid_count: 4,
    has_images: true,
  },
  {
    id: "pelda-ikea-butor-gyor",
    isPlaceholder: true,
    title: "IKEA szekrény összeszerelés",
    description:
      "Gardróbszekrény összeszerelése a hálószobában. Dobozok a helyszínen, kb. 4-5 órás munka lehet.",
    category: "butorosszeszereles",
    sub_categories: ["sima_butorosszeszereles"],
    county: "Győr-Moson-Sopron",
    city: "Győr",
    required_completion_time: "1 héten belül",
    created_at: "2026-06-03T14:20:00.000Z",
    client_display_name: "Márton",
    bid_count: 5,
    has_images: false,
  },
  {
    id: "pelda-csaptelep-pecs",
    isPlaceholder: true,
    title: "Konyhai csaptelep cseréje",
    description:
      "Régi csaptelep kiszerelése és új bekötése. A csap már megvan, csak szakember kell a bekötéshez.",
    category: "viz_gaz",
    sub_categories: ["csaptelep_szifon_csere"],
    county: "Baranya",
    city: "Pécs",
    required_completion_time: "5 napon belül",
    created_at: "2026-06-04T10:45:00.000Z",
    client_display_name: "Judit",
    bid_count: 2,
    has_images: false,
  },
  {
    id: "pelda-festes-szeged",
    isPlaceholder: true,
    title: "Gyerekszoba festése",
    description:
      "Egy kb. 12 m²-es szoba festése fehérre, gletteléssel együtt. A bútorokat mi kihúzzuk a szobából.",
    category: "festes_dekor",
    sub_categories: ["szobafestes", "glett"],
    county: "Csongrád-Csanád",
    city: "Szeged",
    required_completion_time: "2 héten belül",
    created_at: "2026-06-04T16:00:00.000Z",
    client_display_name: "Tamás",
    bid_count: 3,
    has_images: false,
  },
  {
    id: "pelda-tv-konzol-miskolc",
    isPlaceholder: true,
    title: "TV fali konzol szerelése",
    description:
      "55 colos TV felszerelése fali konzolra a nappaliban. A konzol megvan, tégla fal.",
    category: "ezermester",
    sub_categories: ["tv_fali_konzol"],
    county: "Borsod-Abaúj-Zemplén",
    city: "Miskolc",
    required_completion_time: "1 héten belül",
    created_at: "2026-06-05T09:30:00.000Z",
    client_display_name: "Réka",
    bid_count: 2,
    has_images: false,
  },
  {
    id: "pelda-lomtalanitas-nyiregyhaza",
    isPlaceholder: true,
    title: "Pince takarítás és lom elszállítás",
    description:
      "Kb. 15 m³ régi bútor, karton és használaton kívüli holmi elszállítása a pincéből.",
    category: "szallitas",
    sub_categories: ["lomtalanitas_hagyatek"],
    county: "Szabolcs-Szatmár-Bereg",
    city: "Nyíregyháza",
    required_completion_time: "2 héten belül",
    created_at: "2026-06-05T13:10:00.000Z",
    client_display_name: "István",
    bid_count: 1,
    has_images: false,
  },
  {
    id: "pelda-klima-tisztitas-sopron",
    isPlaceholder: true,
    title: "Split klíma tisztítás",
    description:
      "Egy beltéri és kültéri egység tisztítása és fertőtlenítése szezon előtt.",
    category: "klima",
    sub_categories: ["klimatisztitas_fertotlenites"],
    county: "Győr-Moson-Sopron",
    city: "Sopron",
    required_completion_time: "1 héten belül",
    created_at: "2026-06-06T07:50:00.000Z",
    client_display_name: "Anikó",
    bid_count: 2,
    has_images: false,
  },
  {
    id: "pelda-takaritas-kecskemet",
    isPlaceholder: true,
    title: "Nagy takarítás 65 m²-es lakásban",
    description:
      "Teljes lakás takarítása költözés után: konyha, fürdő, nappali, két háló. Ablak is kellene.",
    category: "takaritas",
    sub_categories: ["takaritas", "ablak_kirakat_tisztitas"],
    county: "Bács-Kiskun",
    city: "Kecskemét",
    required_completion_time: "1 héten belül",
    created_at: "2026-06-06T15:00:00.000Z",
    client_display_name: "Zsófi",
    bid_count: 4,
    has_images: false,
  },
];

const placeholderById = new Map(
  PLACEHOLDER_JOBS.map((job) => [job.id, job]),
);

export function isPlaceholderJobId(id: string): boolean {
  return id.startsWith(PLACEHOLDER_JOB_ID_PREFIX);
}

export function getPlaceholderJobListing(
  id: string,
): PlaceholderPublicJob | null {
  return placeholderById.get(id) ?? null;
}

export function listPlaceholderJobPreviews(): PublicJobPreviewItem[] {
  return PLACEHOLDER_JOBS.map((job) => ({
    id: job.id,
    title: job.title,
    category: job.category,
    county: job.county,
    city: job.city,
    created_at: job.created_at,
    isPlaceholder: true,
  }));
}

export function listSimilarPlaceholderJobs(
  jobId: string,
  category: string,
  limit = 4,
): PublicJobPreviewItem[] {
  return PLACEHOLDER_JOBS.filter(
    (job) => job.id !== jobId && job.category === category,
  )
    .slice(0, limit)
    .map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      county: job.county,
      city: job.city,
      created_at: job.created_at,
      isPlaceholder: true,
    }));
}

export function listPlaceholderJobIdsForSitemap(): {
  id: string;
  created_at: string;
}[] {
  return PLACEHOLDER_JOBS.map((job) => ({
    id: job.id,
    created_at: job.created_at,
  }));
}
