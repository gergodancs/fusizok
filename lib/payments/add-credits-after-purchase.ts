import { createAdminClient } from "@/lib/supabase/admin";

type AddCreditsParams = {
  profileId: string;
  amount: number;
  description: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
};

export async function addCreditsAfterPurchase(
  params: AddCreditsParams,
): Promise<{ ok: boolean; outcome?: string; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Admin kliens nem elérhető." };
  }

  const { data, error } = await admin.rpc("add_credits_after_purchase", {
    p_profile_id: params.profileId,
    p_amount: params.amount,
    p_description: params.description,
    p_idempotency_key: params.idempotencyKey,
    p_metadata: params.metadata ?? null,
  });

  if (error) {
    console.error("[addCreditsAfterPurchase] RPC hiba:", error.message);
    return { ok: false, error: error.message };
  }

  const result = data as { success?: boolean; outcome?: string };
  if (!result?.success) {
    return { ok: false, error: "Kredit jóváírás sikertelen." };
  }

  return { ok: true, outcome: result.outcome };
}
