import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CRAFTSMAN_SIGNUP_CREDITS } from "@/lib/credits/constants";

describe("fusizó béta induló kredit", () => {
  it("100 kredit az induló bónusz", () => {
    expect(CRAFTSMAN_SIGNUP_CREDITS).toBe(100);
  });

  it("a migráció idempotens bónuszt ad új fusizóknak", () => {
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250610900000_beta_signup_credits.sql",
    );
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain("_grant_craftsman_signup_credits");
    expect(sql).toContain("v_bonus NUMERIC(10, 1) := 100");
    expect(sql).toContain("'bonus'");
    expect(sql).toContain("Béta induló kredit");
  });
});
