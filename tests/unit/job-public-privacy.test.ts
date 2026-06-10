import { describe, expect, it } from "vitest";
import {
  anonymizeClientDisplayName,
  buildPublicJobSeoTitle,
  formatPublicJobLocation,
} from "@/lib/privacy/job-public";

describe("anonymizeClientDisplayName", () => {
  it("csak keresztnevet ad vissza", () => {
    expect(anonymizeClientDisplayName("Kovács János")).toBe("János");
  });

  it("üres névnél Egy lakos", () => {
    expect(anonymizeClientDisplayName(null)).toBe("Egy lakos");
    expect(anonymizeClientDisplayName("   ")).toBe("Egy lakos");
  });
});

describe("formatPublicJobLocation", () => {
  it("nem tartalmaz irányítószámot", () => {
    const label = formatPublicJobLocation({
      county: "Pest",
      city: "Érd",
    });
    expect(label).toBe("Érd, Pest megye");
    expect(label).not.toMatch(/\d/);
  });

  it("Budapest kerületet városként mutatja", () => {
    expect(
      formatPublicJobLocation({
        county: "Budapest",
        city: "Budapest XI. kerület",
      }),
    ).toBe("Budapest XI. kerület");
  });
});

describe("buildPublicJobSeoTitle", () => {
  it("tartalmazza a címet és helyszínt", () => {
    expect(
      buildPublicJobSeoTitle("Polc fúrás", "Érd, Pest megye"),
    ).toContain("Polc fúrás");
    expect(
      buildPublicJobSeoTitle("Polc fúrás", "Érd, Pest megye"),
    ).toContain("Fusizok.hu");
  });
});
