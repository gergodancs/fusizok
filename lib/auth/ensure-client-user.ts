import type { SupabaseClient, User } from "@supabase/supabase-js";
import { maybeSendWelcomeEmail } from "@/lib/auth/welcome-email";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { TERMS_VERSION } from "@/lib/terms";

export type EnsureClientUserResult =
  | { ok: true; user: User; isNewUser: boolean }
  | { ok: false; error: string };

function isAlreadyRegisteredError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already registered")
  );
}

/**
 * Megrendelő fiók létrehozása vagy bejelentkezés e-mail/jelszó párossal
 * (munkafeladás űrlapról, egy lépésben).
 */
export async function ensureClientUserFromForm(
  supabase: SupabaseClient,
  formData: FormData,
): Promise<EnsureClientUserResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      ok: false,
      error: "Add meg az e-mail címed és a jelszavad a munka feladásához.",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      error: "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
    };
  }

  if (formData.get("accept_terms") !== "on") {
    return {
      ok: false,
      error:
        "A munkafeladáshoz el kell fogadnod az ÁSZF-et és az Adatvédelmi Tájékoztatót.",
    };
  }

  const termsMetadata = {
    role: "client",
    terms_accepted_at: new Date().toISOString(),
    terms_version: TERMS_VERSION,
    privacy_accepted_at: new Date().toISOString(),
    privacy_version: PRIVACY_VERSION,
  };

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: termsMetadata },
  });

  if (!signUpError && signUpData.user) {
    if (!signUpData.session) {
      return {
        ok: false,
        error:
          "Ellenőrizd az e-mail fiókodat a megerősítő linkért, majd jelentkezz be és küldd be újra a munkát.",
      };
    }

    await syncUserProfile(signUpData.user);
    await maybeSendWelcomeEmail(signUpData.user, "client");

    return { ok: true, user: signUpData.user, isNewUser: true };
  }

  if (signUpError && isAlreadyRegisteredError(signUpError.message)) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.user) {
      return {
        ok: false,
        error:
          "Ezzel az e-mail címmel már van fiók. Ha rossz a jelszó, javítsd, vagy jelentkezz be külön.",
      };
    }

    await supabase.auth.updateUser({ data: { role: "client" } });
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();

    const user = freshUser ?? signInData.user;
    await syncUserProfile(user);

    return { ok: true, user, isNewUser: false };
  }

  console.error("[ensure-client-user] Regisztrációs hiba:", signUpError?.message);
  return {
    ok: false,
    error: "A regisztráció sikertelen. Kérjük, próbáld újra.",
  };
}
