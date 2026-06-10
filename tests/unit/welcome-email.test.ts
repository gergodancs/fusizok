import { describe, expect, it } from "vitest";
import {
  WELCOME_EMAIL_SENT_AT_KEY,
  maybeSendWelcomeEmail,
} from "@/lib/auth/welcome-email";
import { buildWelcomeEmailHtml } from "@/lib/notification-templates";
import { CRAFTSMAN_SIGNUP_CREDITS } from "@/lib/credits/constants";

describe("buildWelcomeEmailHtml", () => {
  it("includes craftsman beta onboarding essentials", () => {
    const html = buildWelcomeEmailHtml({
      fullName: "Teszt Elek",
      role: "craftsman",
      actionUrl: "https://fusizok.hu/szaki",
    });

    expect(html).toContain("Teszt Elek");
    expect(html).toContain(String(CRAFTSMAN_SIGNUP_CREDITS));
    expect(html).toContain("nem kell fizetned");
    expect(html).toContain("Profil kitöltése");
    expect(html).toContain("Első pályázat");
    expect(html).toContain("https://fusizok.hu/szaki");
    expect(html).toContain("info@fusizok.hu");
  });

  it("includes client job posting flow", () => {
    const html = buildWelcomeEmailHtml({
      fullName: "Anna",
      role: "client",
      actionUrl: "https://fusizok.hu/lakos",
    });

    expect(html).toContain("Ingyenes munkafeladás");
    expect(html).toContain("Pályázatok érkeznek");
    expect(html).toContain("https://fusizok.hu/lakos");
  });
});

describe("maybeSendWelcomeEmail", () => {
  it("skips when welcome email was already sent", async () => {
    const result = await maybeSendWelcomeEmail(
      {
        id: "user-1",
        email: "teszt@example.com",
        app_metadata: {},
        user_metadata: {
          [WELCOME_EMAIL_SENT_AT_KEY]: "2026-06-01T10:00:00.000Z",
        },
        aud: "authenticated",
        created_at: "2026-06-01T10:00:00.000Z",
      },
      "craftsman",
    );

    expect(result).toEqual({ sent: false, reason: "already_sent" });
  });

  it("skips when user has no email", async () => {
    const result = await maybeSendWelcomeEmail(
      {
        id: "user-2",
        email: undefined,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2026-06-01T10:00:00.000Z",
      },
      "client",
    );

    expect(result).toEqual({ sent: false, reason: "no_email" });
  });
});
