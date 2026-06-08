import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/stripe/config";

let stripeClient: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error(
      "Stripe nincs konfigurálva (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}
