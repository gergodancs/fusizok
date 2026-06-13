import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isBetaCreditRefillActive } from "@/lib/constants/beta";
import { CRAFTSMAN_SIGNUP_CREDITS } from "@/lib/credits/constants";

describe("béta kredit feltöltés", () => {
  it("aktív a promo vége előtt", () => {
    expect(
      isBetaCreditRefillActive(new Date("2026-06-01T12:00:00+02:00")),
    ).toBe(true);
  });

  it("inaktív a promo vége után", () => {
    expect(
      isBetaCreditRefillActive(new Date("2026-07-08T00:00:00+02:00")),
    ).toBe(false);
  });

  it("a migráció feltölti 100-ra és naplózza a tranzakciót", () => {
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250613100000_beta_credit_refill.sql",
    );
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain("refill_beta_craftsman_credits");
    expect(sql).toContain(`v_refill_amount NUMERIC(10, 1) := ${CRAFTSMAN_SIGNUP_CREDITS}`);
    expect(sql).toContain("Béta tesztidőszak – kredit feltöltés");
    expect(sql).toContain("refill_beta_craftsman_credits(p_craftsman_id, p_credit_cost)");
  });
});
