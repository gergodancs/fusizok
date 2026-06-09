/**
 * Országos megye → település/kerület adatbázis (statikus, kliensoldali szűréshez).
 * Budapest: kerületek római számmal. Többi megye: városok és nagyobb községek.
 */

const BUDAPEST_ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
  "XXII",
  "XXIII",
] as const;

export const BUDAPEST_DISTRICTS = BUDAPEST_ROMAN.map(
  (roman) => `Budapest ${roman}. kerület`,
);

export type HungaryCountyData = {
  name: string;
  places: readonly string[];
};

export const HUNGARY_COUNTIES: readonly HungaryCountyData[] = [
  { name: "Budapest", places: BUDAPEST_DISTRICTS },
  {
    name: "Baranya",
    places: [
      "Pécs",
      "Komló",
      "Mohács",
      "Szigetvár",
      "Siklós",
      "Szentlőrinc",
      "Kozármisleny",
      "Bóly",
      "Mágocs",
      "Sásd",
      "Harkány",
      "Villány",
      "Sellye",
    ],
  },
  {
    name: "Bács-Kiskun",
    places: [
      "Kecskemét",
      "Baja",
      "Kiskunfélegyháza",
      "Kiskunhalas",
      "Kalocsa",
      "Kiskőrös",
      "Kiskunmajsa",
      "Jánoshalma",
      "Tiszakécske",
      "Lajosmizse",
      "Soltvadkert",
      "Kecel",
      "Kunfehértó",
    ],
  },
  {
    name: "Békés",
    places: [
      "Békéscsaba",
      "Gyula",
      "Orosháza",
      "Békés",
      "Szarvas",
      "Mezőkovácsháza",
      "Szeghalom",
      "Dévaványa",
      "Mezőberény",
      "Füzesgyarmat",
    ],
  },
  {
    name: "Borsod-Abaúj-Zemplén",
    places: [
      "Miskolc",
      "Kazincbarcika",
      "Ózd",
      "Sárospatak",
      "Szerencs",
      "Sátoraljaújhely",
      "Edelény",
      "Mezőkövesd",
      "Tiszaújváros",
      "Sajószentpéter",
      "Putnok",
      "Encs",
    ],
  },
  {
    name: "Csongrád-Csanád",
    places: [
      "Szeged",
      "Hódmezővásárhely",
      "Szentes",
      "Makó",
      "Csongrád",
      "Mórahalom",
      "Kistelek",
      "Székkutas",
      "Algyő",
      "Ópusztaszer",
    ],
  },
  {
    name: "Fejér",
    places: [
      "Székesfehérvár",
      "Dunaújváros",
      "Mór",
      "Bicske",
      "Gárdony",
      "Enying",
      "Sárbogárd",
      "Martonvásár",
      "Ercsi",
      "Aba",
      "Velence",
      "Lovasberény",
    ],
  },
  {
    name: "Győr-Moson-Sopron",
    places: [
      "Győr",
      "Sopron",
      "Mosonmagyaróvár",
      "Csorna",
      "Kapuvár",
      "Fertőd",
      "Pannonhalma",
      "Tét",
      "Lébény",
      "Rajka",
      "Bőny",
      "Fertőszentmiklós",
    ],
  },
  {
    name: "Hajdú-Bihar",
    places: [
      "Debrecen",
      "Hajdúböszörmény",
      "Hajdúszoboszló",
      "Balmazújváros",
      "Berettyóújfalu",
      "Püspökladány",
      "Tiszavasvári",
      "Komádi",
      "Nádudvar",
      "Polgár",
    ],
  },
  {
    name: "Heves",
    places: [
      "Eger",
      "Gyöngyös",
      "Hatvan",
      "Füzesabony",
      "Lőrinci",
      "Kisköre",
      "Verpelét",
      "Pétervására",
      "Recsk",
      "Heves",
    ],
  },
  {
    name: "Jász-Nagykun-Szolnok",
    places: [
      "Szolnok",
      "Jászberény",
      "Törökszentmiklós",
      "Karcag",
      "Mezőtúr",
      "Kunhegyes",
      "Túrkeve",
      "Martfű",
      "Jászárokszállás",
      "Mezőcsát",
    ],
  },
  {
    name: "Komárom-Esztergom",
    places: [
      "Tatabánya",
      "Esztergom",
      "Komárom",
      "Oroszlány",
      "Tata",
      "Kisbér",
      "Nyergesújfalu",
      "Lábatlan",
      "Dorog",
      "Ács",
      "Bajna",
    ],
  },
  {
    name: "Nógrád",
    places: [
      "Salgótarján",
      "Balassagyarmat",
      "Pásztó",
      "Bátonyterenye",
      "Szécsény",
      "Rétság",
      "Romhány",
      "Pálosvörösmart",
    ],
  },
  {
    name: "Pest",
    places: [
      "Érd",
      "Budaörs",
      "Dunakeszi",
      "Gödöllő",
      "Göd",
      "Vecsés",
      "Vác",
      "Szentendre",
      "Dunaharaszti",
      "Cegléd",
      "Monor",
      "Dabas",
      "Fót",
      "Gyál",
      "Gyömrő",
      "Halásztelek",
      "Isaszeg",
      "Nagykőrös",
      "Pilis",
      "Pilisvörösvár",
      "Pomáz",
      "Szigetszentmiklós",
      "Sződ",
      "Tárnok",
      "Üllő",
      "Veresegyház",
      "Budakeszi",
      "Törökbálint",
      "Biatorbágy",
      "Albertirsa",
      "Aszód",
      "Abony",
      "Ráckeve",
      "Dunavarsány",
      "Mogyoród",
      "Kerepes",
      "Kistarcsa",
      "Maglód",
    ],
  },
  {
    name: "Somogy",
    places: [
      "Kaposvár",
      "Siófok",
      "Marcali",
      "Barcs",
      "Nagyatád",
      "Balatonboglár",
      "Fonyód",
      "Csurgó",
      "Kadarkút",
      "Tab",
    ],
  },
  {
    name: "Szabolcs-Szatmár-Bereg",
    places: [
      "Nyíregyháza",
      "Mátészalka",
      "Kisvárda",
      "Vásárosnamény",
      "Nyírbátor",
      "Baktalórántháza",
      "Tiszavasvári",
      "Nagykálló",
      "Záhony",
      "Fehérgyarmat",
    ],
  },
  {
    name: "Tolna",
    places: [
      "Szekszárd",
      "Dombóvár",
      "Paks",
      "Bonyhád",
      "Tamási",
      "Sárvár",
      "Nagymányok",
      "Bátaszék",
      "Simontornya",
    ],
  },
  {
    name: "Vas",
    places: [
      "Szombathely",
      "Kőszeg",
      "Sárvár",
      "Körmend",
      "Celldömölk",
      "Szentgotthárd",
      "Vasvár",
      "Ják",
      "Répcelak",
    ],
  },
  {
    name: "Veszprém",
    places: [
      "Veszprém",
      "Tapolca",
      "Ajka",
      "Pápa",
      "Várpalota",
      "Balatonfüred",
      "Balatonalmádi",
      "Zirc",
      "Devecser",
      "Berhida",
      "Úrkút",
    ],
  },
  {
    name: "Zala",
    places: [
      "Zalaegerszeg",
      "Keszthely",
      "Nagykanizsa",
      "Lenti",
      "Letenye",
      "Pacsa",
      "Zalakaros",
      "Hévíz",
      "Balatonederics",
      "Türje",
    ],
  },
] as const;

export const HUNGARY_COUNTY_NAMES = HUNGARY_COUNTIES.map((c) => c.name);

const countyMap = new Map(
  HUNGARY_COUNTIES.map((county) => [county.name, county.places] as const),
);

export function getPlacesForCounty(countyName: string): string[] {
  const places = countyMap.get(countyName);
  return places ? [...places] : [];
}

export function findCountyByName(countyName: string): HungaryCountyData | undefined {
  return HUNGARY_COUNTIES.find((c) => c.name === countyName);
}

export function isHungaryCounty(countyName: string): boolean {
  return countyMap.has(countyName);
}

export function isPlaceInCounty(countyName: string, placeName: string): boolean {
  const places = countyMap.get(countyName);
  return places?.includes(placeName) ?? false;
}

export function filterPlaces(countyName: string, query: string): string[] {
  const places = getPlacesForCounty(countyName);
  const normalized = query.trim().toLocaleLowerCase("hu");
  if (!normalized) {
    return places;
  }
  return places.filter((place) =>
    place.toLocaleLowerCase("hu").includes(normalized),
  );
}
