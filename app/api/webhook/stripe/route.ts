import { NextResponse } from "next/server";
import Stripe from "stripe";
import { activateContactAfterPayment } from "@/lib/payments/activate-contact-after-payment";
import { getStripeServerClient } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getClientName(clientId: string): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "A megrendelő";

  const { data } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", clientId)
    .maybeSingle();

  return data?.full_name ?? "A megrendelő";
}

async function getJobTitle(jobId: string): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "Munka";

  const { data } = await admin
    .from("jobs")
    .select("title")
    .eq("id", jobId)
    .maybeSingle();

  return data?.title ?? "Munka";
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const metadata = session.metadata ?? {};
  const bidId = metadata.bid_id;
  const jobId = metadata.job_id;
  const craftsmanId = metadata.craftsman_id;
  const clientId = metadata.client_id;

  console.log("[stripe-webhook] checkout.session.completed feldolgozás", {
    eventId,
    sessionId: session.id,
    bidId,
    jobId,
    craftsmanId,
    paymentStatus: session.payment_status,
  });

  if (session.payment_status !== "paid") {
    console.warn("[stripe-webhook] Session nem paid státuszú, kihagyás", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  if (!bidId || !jobId || !craftsmanId || !clientId) {
    console.error("[stripe-webhook] Hiányzó metadata a sessionben", {
      sessionId: session.id,
      metadata,
    });
    throw new Error("Hiányzó checkout session metadata.");
  }

  const clientName = await getClientName(clientId);
  const jobTitle = await getJobTitle(jobId);
  const introMessage = `Szia! ${clientName}-nek tetszik az ajánlatod, mondj róla többet!`;

  await activateContactAfterPayment({
    bidId,
    idempotencyKey: eventId,
    clientId,
    introMessage,
    metadata: {
      bid_id: bidId,
      job_id: jobId,
      craftsman_id: craftsmanId,
      client_id: clientId,
      stripe_session_id: session.id,
      payment_type: metadata.payment_type ?? "legacy",
    },
    clientName,
    jobTitle,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET hiányzik");
    return NextResponse.json(
      { error: "Webhook nincs konfigurálva." },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[stripe-webhook] Hiányzó stripe-signature header");
      return NextResponse.json({ error: "Hiányzó aláírás." }, { status: 400 });
    }

    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log("[stripe-webhook] Esemény ellenőrizve:", event.type, event.id);
  } catch (err) {
    console.error("[stripe-webhook] Aláírás-ellenőrzési hiba:", err);
    return NextResponse.json({ error: "Érvénytelen aláírás." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session, event.id);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("[stripe-webhook] Feldolgozási hiba – 500 a Stripe újrapróbáláshoz", {
        eventId: event.id,
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        { error: "Feldolgozási hiba." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
