"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseRoleFormValue } from "@/lib/auth/oauth-role";
import { resolvePostLoginPath } from "@/lib/auth/resolve-post-login-path";
import { syncUserProfile } from "@/lib/auth/sync-profile";
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
  const selectedRole = parseRoleFormValue(formData.get("role"));

  if (!selectedRole) {
    return { error: "Kérjük, válaszd ki a fiók típusát a bejelentkezéshez." };
  }

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
    const { error: roleError } = await supabase.auth.updateUser({
      data: { role: selectedRole },
    });

    if (roleError) {
      console.error("Szerepkör frissítési hiba:", roleError.message);
    }

    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();

    await syncUserProfile(freshUser ?? data.user);
  }

  revalidatePath("/", "layout");

  redirect(resolvePostLoginPath(redirectTo, selectedRole));
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    console.error("Regisztrációs hiba:", error.message);
    return { error: "A regisztráció sikertelen. Kérjük, próbálja újra." };
  }

  if (data.session && data.user) {
    await syncUserProfile(data.user);
    revalidatePath("/", "layout");
    redirect(resolvePostLoginPath(redirectTo, role));
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
