"use server";

import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
): Promise<{ ok: boolean; error?: string; subscriptionId?: string }> {
  const user = await getSessionUser();
  if (!user) {
    console.warn("[push-subscription] Mentés sikertelen: nincs bejelentkezve");
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
    console.warn("[push-subscription] Érvénytelen előfizetés adatok");
    return { ok: false, error: "Érvénytelen előfizetés." };
  }

  const row = {
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    user_agent: subscription.userAgent ?? null,
  };

  console.log("[push-subscription] Mentés indul:", {
    userId: user.id,
    endpoint: subscription.endpoint.slice(0, 50) + "…",
  });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_push_subscriptions")
    .upsert(row, { onConflict: "user_id,endpoint" })
    .select("id")
    .single();

  if (!error && data) {
    console.log("[push-subscription] Sikeres mentés (user client):", data.id);
    return { ok: true, subscriptionId: data.id };
  }

  console.error(
    "[push-subscription] User client mentési hiba:",
    error?.message,
    error?.code,
  );

  const admin = createAdminClient();
  if (admin) {
    const { data: adminData, error: adminError } = await admin
      .from("user_push_subscriptions")
      .upsert(row, { onConflict: "user_id,endpoint" })
      .select("id")
      .single();

    if (!adminError && adminData) {
      console.log(
        "[push-subscription] Sikeres mentés (admin fallback):",
        adminData.id,
      );
      return { ok: true, subscriptionId: adminData.id };
    }

    console.error(
      "[push-subscription] Admin mentési hiba:",
      adminError?.message,
      adminError?.code,
    );
    return {
      ok: false,
      error: adminError?.message ?? "Az előfizetés mentése sikertelen.",
    };
  }

  return {
    ok: false,
    error:
      error?.message ??
      "Az előfizetés mentése sikertelen. Ellenőrizd az RLS szabályokat.",
  };
}
