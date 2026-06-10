import { describe, expect, it } from "vitest";
import {
  buildCraftsmanOnboardingSteps,
  summarizeOnboarding,
} from "@/lib/craftsman/onboarding";

describe("layout snapshot onboarding mapping", () => {
  it("teljes profil esetén minden lépés kész", () => {
    const status = summarizeOnboarding(
      buildCraftsmanOnboardingSteps({
        hasSubCategories: true,
        hasServiceArea: true,
        hasBio: true,
        hasAvatar: true,
        portfolioCount: 2,
        hasBid: true,
      }),
    );

    expect(status.completedCount).toBe(5);
    expect(status.requiredComplete).toBe(true);
    expect(status.progressPercent).toBe(100);
  });

  it("hiányos profilnál a kötelező lépés blokkol", () => {
    const status = summarizeOnboarding(
      buildCraftsmanOnboardingSteps({
        hasSubCategories: false,
        hasServiceArea: false,
        hasBio: false,
        hasAvatar: false,
        portfolioCount: 0,
        hasBid: false,
      }),
    );

    expect(status.requiredComplete).toBe(false);
    expect(status.completedCount).toBe(0);
  });
});

describe("nav snapshot migration", () => {
  it("tartalmazza a layout RPC-ket", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const sql = readFileSync(
      join(
        process.cwd(),
        "supabase/migrations/20250611000000_nav_snapshot_rpcs.sql",
      ),
      "utf8",
    );

    expect(sql).toContain("get_craftsman_layout_snapshot");
    expect(sql).toContain("get_client_layout_snapshot");
    expect(sql).toContain("count_unread_messages_for_user");
    expect(sql).toContain("count_unseen_open_jobs_for_craftsman");
  });
});
