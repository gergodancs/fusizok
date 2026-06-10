import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PlatformStats = {
  craftsmanCount: number;
  clientCount: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());

  const [craftsmenResult, clientsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "craftsman"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
  ]);

  if (craftsmenResult.error) {
    console.error("Fusizó számláló hiba:", craftsmenResult.error.message);
  }
  if (clientsResult.error) {
    console.error("Lakos számláló hiba:", clientsResult.error.message);
  }

  return {
    craftsmanCount: craftsmenResult.count ?? 0,
    clientCount: clientsResult.count ?? 0,
  };
}

export function formatPlatformCount(value: number): string {
  return new Intl.NumberFormat("hu-HU").format(value);
}
