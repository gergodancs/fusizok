"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = {
  error?: string;
};

export async function deleteAccount(): Promise<DeleteAccountState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "A fiók törlése jelenleg nem érhető el. Kérjük, írj az adatvedelem@fusizok.hu címre.",
    };
  }

  const { error: jobsError } = await admin
    .from("jobs")
    .delete()
    .eq("client_id", user.id);

  if (jobsError) {
    console.error("Fiók törlés – munkák:", jobsError.message);
  }

  const { error: craftsmanError } = await admin
    .from("craftsman_profiles")
    .delete()
    .eq("id", user.id);

  if (craftsmanError) {
    console.error("Fiók törlés – fusizó profil:", craftsmanError.message);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    console.error("Fiók törlés – profil:", profileError.message);
    return { error: "A profil törlése sikertelen. Kérjük, próbálja újra." };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);

  if (authError) {
    console.error("Fiók törlés – auth:", authError.message);
    return { error: "A fiók törlése sikertelen. Kérjük, próbálja újra." };
  }

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });

  redirect("/");
}
