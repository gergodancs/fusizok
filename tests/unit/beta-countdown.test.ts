import { describe, expect, it } from "vitest";
import { getPromoCountdown } from "@/lib/beta/countdown";
import { SIGNUP_CREDITS_PROMO_ENDS_AT } from "@/lib/constants/beta";
import {
  buildCraftsmanOnboardingSteps,
  summarizeOnboarding,
} from "@/lib/craftsman/onboarding";

describe("getPromoCountdown", () => {
  it("lejártként jelzi a múltbeli dátumot", () => {
    const result = getPromoCountdown(
      "2020-01-01T00:00:00+01:00",
      new Date("2025-01-01T00:00:00+01:00"),
    );
    expect(result.expired).toBe(true);
  });

  it("napokat számol a jövőbeli akcióhoz", () => {
    const result = getPromoCountdown(
      SIGNUP_CREDITS_PROMO_ENDS_AT,
      new Date("2026-06-07T12:00:00+02:00"),
    );
    expect(result.expired).toBe(false);
    expect(result.days).toBeGreaterThan(0);
  });
});

describe("craftsman onboarding", () => {
  it("kötelező lépés a tevékenység és terület", () => {
    const steps = buildCraftsmanOnboardingSteps({
      hasSubCategories: false,
      hasServiceArea: false,
      hasBio: false,
      hasAvatar: false,
      portfolioCount: 0,
      hasBid: false,
    });

    const summary = summarizeOnboarding(steps);
    expect(summary.requiredComplete).toBe(false);
    expect(steps.find((s) => s.id === "skills-area")?.required).toBe(true);
  });
});
