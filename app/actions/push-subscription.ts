"use server";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
    return { ok: false, error: "Érvénytelen előfizetés." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("user_push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      user_agent: subscription.userAgent ?? null,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    console.error("Push előfizetés mentési hiba:", error.message);
    return { ok: false, error: "Az előfizetés mentése sikertelen." };
  }

  return { ok: true };
}
