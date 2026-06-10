import { createClient } from "@/lib/supabase/server";

export type CraftsmanKycInfo = {
  isVerified: boolean;
  kycStatus: string;
};

export async function getCraftsmanKycInfo(
  userId: string,
): Promise<CraftsmanKycInfo> {
  const supabase = await createClient();

  const [{ data: profile }, { data: craftsman }] = await Promise.all([
    supabase.from("profiles").select("is_verified").eq("id", userId).maybeSingle(),
    supabase
      .from("craftsman_profiles")
      .select("kyc_status")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  return {
    isVerified: Boolean(profile?.is_verified),
    kycStatus: craftsman?.kyc_status ?? "none",
  };
}
