import { describe, expect, it } from "vitest";
import {
  craftsmanMatchesJobSkills,
  getBroadcastSubCategoryKeys,
  isBroadcastJobCategory,
  isOtherSubCategoryKey,
  MAIN_CATEGORIES,
  OTHER_MAIN_CATEGORY_ID,
} from "@/lib/constants/categories";

describe("isOtherSubCategoryKey", () => {
  it("egyeb_ prefix és altalanos kulcs is egyéb", () => {
    expect(isOtherSubCategoryKey("egyeb_villany")).toBe(true);
    expect(isOtherSubCategoryKey("egyeb_altalanos")).toBe(true);
    expect(isOtherSubCategoryKey("funyiras")).toBe(false);
  });
});

describe("isBroadcastJobCategory", () => {
  it("fő Egyéb kategória broadcast", () => {
    expect(isBroadcastJobCategory(OTHER_MAIN_CATEGORY_ID, ["egyeb_altalanos"])).toBe(
      true,
    );
  });

  it("egyeb_* alszakma broadcast", () => {
    expect(isBroadcastJobCategory("villanyszereles", ["egyeb_villany"])).toBe(true);
  });

  it("normál szakma nem broadcast", () => {
    expect(isBroadcastJobCategory("villanyszereles", ["lampa_bekotes_felszereles"])).toBe(
      false,
    );
  });
});

describe("craftsmanMatchesJobSkills", () => {
  it("broadcast munkánál minden fusizó illeszkedik szakma szerint", () => {
    expect(
      craftsmanMatchesJobSkills(
        ["funyiras"],
        ["kertgondozas"],
        "villanyszereles",
        ["egyeb_villany"],
      ),
    ).toBe(true);
  });

  it("normál munkánál sub egyezés kell", () => {
    expect(
      craftsmanMatchesJobSkills(
        ["lampa_bekotes_felszereles"],
        ["villanyszereles"],
        "villanyszereles",
        ["lampa_bekotes_felszereles"],
      ),
    ).toBe(true);

    expect(
      craftsmanMatchesJobSkills(
        ["funyiras"],
        ["kertgondozas"],
        "villanyszereles",
        ["lampa_bekotes_felszereles"],
      ),
    ).toBe(false);
  });
});

describe("category data integrity", () => {
  it("minden főkategóriának van Egyéb alszakmája", () => {
    for (const main of MAIN_CATEGORIES) {
      if (main.id === OTHER_MAIN_CATEGORY_ID) {
        continue;
      }
      expect(
        main.subActivities.some((sub) => isOtherSubCategoryKey(sub.key)),
        `${main.id} hiányzik egyeb alszakma`,
      ).toBe(true);
    }
  });

  it("broadcast kulcsok tartalmazzák az összes egyeb_* alszakmát", () => {
    const keys = getBroadcastSubCategoryKeys();
    const expected = MAIN_CATEGORIES.flatMap((main) =>
      main.subActivities.filter((sub) => isOtherSubCategoryKey(sub.key)).map((sub) => sub.key),
    );
    expect(keys.sort()).toEqual([...new Set(expected)].sort());
  });
});
