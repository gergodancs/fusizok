import { describe, expect, it } from "vitest";
import {
  hufToStripeCheckoutUnitAmount,
  parsePriceHufFromEnv,
  validateStripeContactUnlockPrice,
} from "@/lib/stripe/huf-amount";

describe("Stripe HUF összeg konverzió", () => {
  it("990 Ft → 99000 Stripe unit_amount (nem 9,90 Ft)", () => {
    expect(hufToStripeCheckoutUnitAmount(990)).toBe(99000);
  });

  it("175 Ft minimum Stripe unit_amount", () => {
    expect(hufToStripeCheckoutUnitAmount(175)).toBe(17500);
  });

  it("parsePriceHufFromEnv kezeli a tizedes és vesszős formátumot", () => {
    expect(parsePriceHufFromEnv("990", 0)).toBe(990);
    expect(parsePriceHufFromEnv("990,5", 0)).toBe(991);
    expect(parsePriceHufFromEnv(undefined, 990)).toBe(990);
    expect(parsePriceHufFromEnv("abc", 990)).toBe(990);
  });

  it("validateStripeContactUnlockPrice elutasítja a túl alacsony árat", () => {
    const result = validateStripeContactUnlockPrice(9);
    expect(result.ok).toBe(false);
  });

  it("validateStripeContactUnlockPrice elfogadja a 990 Ft-ot", () => {
    const result = validateStripeContactUnlockPrice(990);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.unitAmount).toBe(99000);
    }
  });
});
