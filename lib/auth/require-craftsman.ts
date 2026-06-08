import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";

export async function requireCraftsman(redirectPath = "/szaki") {
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect(`/login?redirect=${redirectPath}`);
  }

  if (profile?.role === "client") {
    redirect("/lakos");
  }

  if (!profile || profile.role !== "craftsman") {
    redirect(`/login?redirect=${redirectPath}`);
  }

  return { user, profile };
}
