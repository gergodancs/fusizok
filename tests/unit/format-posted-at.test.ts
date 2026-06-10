import { describe, expect, it } from "vitest";
import {
  formatJobPostedAt,
  formatJobPostedAtExact,
} from "@/lib/jobs/format-posted-at";

describe("formatJobPostedAt", () => {
  const now = new Date("2026-06-07T14:00:00.000Z");

  it("formats recent postings in Hungarian", () => {
    expect(
      formatJobPostedAt("2026-06-07T13:50:00.000Z", now),
    ).toBe("10 perce");
    expect(formatJobPostedAt("2026-06-07T12:00:00.000Z", now)).toBe("2 órája");
    expect(formatJobPostedAt("2026-06-06T14:00:00.000Z", now)).toBe("tegnap");
  });

  it("returns null for invalid values", () => {
    expect(formatJobPostedAt(null, now)).toBeNull();
    expect(formatJobPostedAt("invalid", now)).toBeNull();
  });
});

describe("formatJobPostedAtExact", () => {
  it("returns a Hungarian datetime string", () => {
    const exact = formatJobPostedAtExact("2026-06-07T10:30:00.000Z");
    expect(exact).toContain("2026");
  });
});
