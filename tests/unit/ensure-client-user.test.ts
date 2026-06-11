import { describe, expect, it } from "vitest";
import { ensureClientUserFromForm } from "@/lib/auth/ensure-client-user";

function buildFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe("ensureClientUserFromForm", () => {
  it("requires email and password", async () => {
    const supabase = {
      auth: {
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: null,
        }),
      },
    };

    const result = await ensureClientUserFromForm(
      supabase as never,
      buildFormData({ accept_terms: "on" }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Add meg az e-mail címed és a jelszavad a munka feladásához.",
    });
  });

  it("requires accepted terms", async () => {
    const supabase = {
      auth: {
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: null,
        }),
      },
    };

    const result = await ensureClientUserFromForm(
      supabase as never,
      buildFormData({
        email: "teszt@example.com",
        password: "titkos123",
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("ÁSZF");
    }
  });
});
