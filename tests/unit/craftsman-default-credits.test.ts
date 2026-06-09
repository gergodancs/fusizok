import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FREE_CREDITS } from "@/lib/chat-payment/constants";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("1. Új fusizó regisztráció – ingyenes kredit", () => {
  it("a DEFAULT_FREE_CREDITS konstans pontosan 1", () => {
    expect(DEFAULT_FREE_CREDITS).toBe(1);
  });

  it("a migráció 1-re állítja a free_credits alapértelmezést", () => {
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250608210000_one_free_credit_craftsman_pays.sql",
    );
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toMatch(/ALTER COLUMN free_credits SET DEFAULT 1/);
  });

  it("syncUserProfile nem írja felül a free_credits mezőt (DB default marad)", async () => {
    const craftsmanUpsert = vi.fn().mockResolvedValue({ error: null });
    const profileUpsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "profiles") return { upsert: profileUpsert };
        if (table === "craftsman_profiles") return { upsert: craftsmanUpsert };
        return {};
      }),
    } as never);

    await syncUserProfile({
      id: "craftsman-new",
      user_metadata: { role: "craftsman", full_name: "Teszt Fusizó" },
    } as never);

    expect(craftsmanUpsert).toHaveBeenCalledTimes(1);
    const payload = craftsmanUpsert.mock.calls[0]![0] as Record<string, unknown>;
    expect(payload.id).toBe("craftsman-new");
    expect(payload.coverage_counties).toEqual([]);
    expect(payload.coverage_zip_codes).toEqual([]);
    expect(payload).not.toHaveProperty("free_credits");
  });

  it("új craftsman_profiles sor esetén a migráció szerint 1 a default kredit", () => {
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250608210000_one_free_credit_craftsman_pays.sql",
    );
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain("free_credits = 1");
    expect(DEFAULT_FREE_CREDITS).toBe(1);
  });
});
