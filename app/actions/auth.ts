"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  }

  revalidatePath("/", "layout");

  const role = data.user?.user_metadata?.role;
  const destination =
    redirectTo !== "/"
      ? redirectTo
      : role === "craftsman"
        ? "/szaki"
        : "/lakos";

  redirect(destination);
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "client";
  const redirectTo = getRedirectPath(formData);

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
    redirect(redirectTo);
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
