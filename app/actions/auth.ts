"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseRoleFormValue } from "@/lib/auth/oauth-role";
import {
  resolvePostLoginPath,
  withPioneerZoneQuery,
} from "@/lib/auth/resolve-post-login-path";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import {
  parseLocationFromFormData,
  parseServiceRadiusKm,
} from "@/lib/location/parse-location-form";
import { persistCraftsmanLocation } from "@/lib/location/persist-location";
import { saveCraftsmanLocationFromForm } from "@/lib/location/save-craftsman-location";
import { isPioneerZoneForCraftsman } from "@/lib/zone-activity";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { TERMS_VERSION } from "@/lib/terms";
import { maybeSendWelcomeEmail } from "@/lib/auth/welcome-email";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

function getRedirectPath(formData: FormData): string {
  const redirectTo = (formData.get("redirect") as string) || "/";
  return redirectTo.startsWith("/") ? redirectTo : "/";
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = getRedirectPath(formData);

  if (!email || !password) {
    return { error: "Kérjük, adja meg az e-mail címet és a jelszót." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Bejelentkezési hiba:", error.message);
    return { error: "Hibás e-mail cím vagy jelszó." };
  }

  if (data.user) {
    await syncUserProfile(data.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role =
      profile?.role === "craftsman" || profile?.role === "client"
        ? profile.role
        : data.user.user_metadata?.role === "craftsman"
          ? "craftsman"
          : "client";

    revalidatePath("/", "layout");
    redirect(resolvePostLoginPath(redirectTo, role));
  }

  return { error: "A bejelentkezés sikertelen." };
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = parseRoleFormValue(formData.get("role"));
  const redirectTo = getRedirectPath(formData);

  if (!role) {
    return { error: "Kérjük, válaszd ki a fiók típusát a regisztrációhoz." };
  }

  if (!fullName) {
    return { error: "Kérjük, adja meg a teljes nevét." };
  }

  if (!email || !password) {
    return { error: "Kérjük, adja meg az e-mail címet és a jelszót." };
  }

  if (password.length < 6) {
    return { error: "A jelszónak legalább 6 karakter hosszúnak kell lennie." };
  }

  if (formData.get("accept_terms") !== "on") {
    return {
      error:
        "A regisztrációhoz el kell fogadnod az ÁSZF-et és az Adatvédelmi Tájékoztatót!",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        privacy_accepted_at: new Date().toISOString(),
        privacy_version: PRIVACY_VERSION,
      },
    },
  });

  if (error) {
    console.error("Regisztrációs hiba:", error.message);
    return { error: "A regisztráció sikertelen. Kérjük, próbálja újra." };
  }

  if (data.user) {
    const welcomeResult = await maybeSendWelcomeEmail(data.user, role, {
      fullName,
    });

    if (welcomeResult.sent) {
      console.log("[register] Üdvözlő e-mail elküldve:", email);
    } else if (welcomeResult.reason !== "already_sent") {
      console.warn(
        "[register] Üdvözlő e-mail nem ment ki:",
        welcomeResult.reason,
        welcomeResult.error ?? "",
      );
    }
  }

  if (data.session && data.user) {
    await syncUserProfile(data.user);

    let pioneerZone = false;
    if (role === "craftsman") {
      const location = parseLocationFromFormData(formData);
      if (location) {
        const serviceRadiusKm = parseServiceRadiusKm(formData);
        const resolved = await persistCraftsmanLocation(
          supabase,
          data.user.id,
          location,
          serviceRadiusKm,
        );
        pioneerZone = await isPioneerZoneForCraftsman(
          resolved,
          serviceRadiusKm,
        );
      } else {
        await saveCraftsmanLocationFromForm(supabase, data.user.id, formData);
      }
    }

    revalidatePath("/", "layout");
    let destination = resolvePostLoginPath(redirectTo, role);
    if (pioneerZone) {
      destination = withPioneerZoneQuery(destination, "craftsman");
    }
    redirect(destination);
  }

  return {
    success:
      "Sikeres regisztráció! Ha engedélyezve van az e-mail megerősítés, ellenőrizze postafiókját, majd jelentkezzen be.",
  };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    console.error("Kijelentkezési hiba:", error.message);
    throw new Error("A kijelentkezés sikertelen.");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
