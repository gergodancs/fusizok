"use server";

import { getSessionUser } from "@/lib/auth/session";
import {
  getAppBaseUrl,
  getStripeContactUnlockPriceHuf,
  isStripeConfigured,
} from "@/lib/stripe/config";
import { getStripeServerClient } from "@/lib/stripe/server";
import type { CreateCheckoutSessionResult } from "@/lib/types/payments";
import { createClient } from "@/lib/supabase/server";

export async function createCraftsmanChatCheckoutSession(
  bidId: string,
  conversationId: string,
): Promise<CreateCheckoutSessionResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  if (!isStripeConfigured()) {
    return { ok: false, error: "A fizetési szolgáltatás nincs konfigurálva." };
  }

  const supabase = await createClient();

  const { data: bid, error: bidError } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, status, contact_shared")
    .eq("id", bidId)
    .maybeSingle();

  if (bidError || !bid) {
    return { ok: false, error: "Az ajánlat nem található." };
  }

  if (bid.craftsman_id !== user.id) {
    return { ok: false, error: "Nincs jogosultságod ehhez a chathez." };
  }

  if (!bid.contact_shared || bid.status !== "pending_payment") {
    return { ok: false, error: "Ehhez a chathez nem szükséges fizetés." };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, title, status")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job) {
    return { ok: false, error: "A munka nem található." };
  }

  if (job.status === "cancelled" || job.status === "completed") {
    return { ok: false, error: "Ez a munka már nem elérhető." };
  }

  const appUrl = getAppBaseUrl();
  const priceHuf = getStripeContactUnlockPriceHuf();

  try {
    const stripe = getStripeServerClient();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "elements",
        line_items: [
          {
            price_data: {
              currency: "huf",
              unit_amount: priceHuf,
              product_data: {
                name: "Chat válaszadás",
                description: `${job.title} – válasz jogosultság`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          bid_id: bid.id,
          job_id: job.id,
          craftsman_id: bid.craftsman_id,
          client_id: job.client_id,
          payment_type: "craftsman_chat_unlock",
        },
        return_url: `${appUrl}/szaki/uzenetek/${conversationId}?payment_return=1&bid_id=${bid.id}`,
      },
      {
        idempotencyKey: `craftsman-chat-${bid.id}-${user.id}`,
      },
    );

    if (!session.client_secret) {
      return {
        ok: false,
        error: "A fizetési munkamenet létrehozása sikertelen.",
      };
    }

    console.log("[createCraftsmanChatCheckoutSession] Session létrehozva", {
      bidId,
      conversationId,
      craftsmanId: user.id,
    });

    return {
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (err) {
    console.error("[createCraftsmanChatCheckoutSession] Stripe hiba:", err);
    return { ok: false, error: "A fizetés indítása sikertelen. Próbáld újra." };
  }
}

export async function pollCraftsmanChatUnlock(
  bidId: string,
): Promise<{ ok: boolean; unlocked: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, unlocked: false, error: "Bejelentkezés szükséges." };
  }

  const supabase = await createClient();

  const { data: bid } = await supabase
    .from("job_bids")
    .select("id, craftsman_id, status")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid || bid.craftsman_id !== user.id) {
    return { ok: false, unlocked: false, error: "Nincs jogosultság." };
  }

  return { ok: true, unlocked: bid.status === "active" };
}
