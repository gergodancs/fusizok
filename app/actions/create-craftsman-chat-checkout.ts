"use server";

import { getSessionUser } from "@/lib/auth/session";
import {
  getAppBaseUrl,
  getStripeContactUnlockPriceHuf,
  isStripeConfigured,
} from "@/lib/stripe/config";
import {
  STRIPE_HUF_MIN_FORINTS,
  validateStripeContactUnlockPrice,
} from "@/lib/stripe/huf-amount";
import { activateContactAfterPayment } from "@/lib/payments/activate-contact-after-payment";
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
  const priceValidation = validateStripeContactUnlockPrice(priceHuf);

  if (!priceValidation.ok) {
    console.error("[createCraftsmanChatCheckoutSession] Érvénytelen ár:", {
      priceHuf,
      env: process.env.STRIPE_CONTACT_UNLOCK_PRICE_HUF,
    });
    return { ok: false, error: priceValidation.error };
  }

  try {
    const stripe = getStripeServerClient();

    console.log("[createCraftsmanChatCheckoutSession] Stripe session indítás", {
      bidId,
      priceHuf,
      stripeUnitAmount: priceValidation.unitAmount,
      envPrice: process.env.STRIPE_CONTACT_UNLOCK_PRICE_HUF ?? "(nincs)",
      appUrl,
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "elements",
        redirect_on_completion: "never",
        line_items: [
          {
            price_data: {
              currency: "huf",
              unit_amount: priceValidation.unitAmount,
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
        return_url: `${appUrl}/szaki/uzenetek/${conversationId}?payment_return=1&bid_id=${bid.id}&session_id={CHECKOUT_SESSION_ID}`,
      },
      {
        // Az összeg a kulcsban: korábbi (hibás) kérések ne cache-elődjenek vissza.
        idempotencyKey: `craftsman-chat-v2-${bid.id}-${user.id}-${priceValidation.unitAmount}`,
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
      priceHuf,
      stripeUnitAmount: priceValidation.unitAmount,
    });

    return {
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (err) {
    console.error("[createCraftsmanChatCheckoutSession] Stripe hiba:", err);

    const stripeErr = err as { code?: string };
    if (stripeErr.code === "amount_too_small") {
      return {
        ok: false,
        error: `A fizetési összeg túl alacsony (minimum ${STRIPE_HUF_MIN_FORINTS} Ft). Ellenőrizd a STRIPE_CONTACT_UNLOCK_PRICE_HUF beállítást (ajánlott: 990).`,
      };
    }

    return { ok: false, error: "A fizetés indítása sikertelen. Próbáld újra." };
  }
}

export async function completeCraftsmanChatPaymentAfterCheckout(
  sessionId: string,
  bidId: string,
): Promise<{ ok: boolean; unlocked: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, unlocked: false, error: "Bejelentkezés szükséges." };
  }

  if (!isStripeConfigured()) {
    return {
      ok: false,
      unlocked: false,
      error: "A fizetési szolgáltatás nincs konfigurálva.",
    };
  }

  const supabase = await createClient();

  const { data: bid } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, status")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid || bid.craftsman_id !== user.id) {
    return { ok: false, unlocked: false, error: "Nincs jogosultság." };
  }

  if (bid.status === "active") {
    return { ok: true, unlocked: true };
  }

  try {
    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { ok: true, unlocked: false };
    }

    const metadata = session.metadata ?? {};
    if (
      metadata.bid_id !== bidId ||
      metadata.craftsman_id !== user.id ||
      metadata.payment_type !== "craftsman_chat_unlock"
    ) {
      console.error("[completeCraftsmanChatPayment] Metadata eltérés", {
        sessionId,
        bidId,
        metadata,
      });
      return {
        ok: false,
        unlocked: false,
        error: "Érvénytelen fizetési session.",
      };
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, client_id, title")
      .eq("id", bid.job_id)
      .maybeSingle();

    if (!job) {
      return { ok: false, unlocked: false, error: "A munka nem található." };
    }

    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", job.client_id)
      .maybeSingle();

    await activateContactAfterPayment({
      bidId,
      idempotencyKey: `craftsman-chat-paid-${sessionId}`,
      clientId: job.client_id,
      introMessage: "",
      metadata: {
        bid_id: bidId,
        job_id: job.id,
        craftsman_id: user.id,
        client_id: job.client_id,
        stripe_session_id: sessionId,
        payment_type: "craftsman_chat_unlock",
      },
      clientName: clientProfile?.full_name ?? "A megrendelő",
      jobTitle: job.title,
    });

    const { data: updatedBid } = await supabase
      .from("job_bids")
      .select("status")
      .eq("id", bidId)
      .maybeSingle();

    return {
      ok: true,
      unlocked: updatedBid?.status === "active",
    };
  } catch (err) {
    console.error("[completeCraftsmanChatPayment] hiba:", err);
    return {
      ok: false,
      unlocked: false,
      error: "A fizetés ellenőrzése sikertelen.",
    };
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
