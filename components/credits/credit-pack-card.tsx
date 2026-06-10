"use client";

import { useState } from "react";
import {
  completeCreditPurchaseAfterCheckout,
  createCreditCheckoutSession,
} from "@/app/actions/create-credit-checkout";
import { ContactPaymentModal } from "@/components/payments/contact-payment-modal";
import type { CreditPack } from "@/lib/credits/packages";
import { formatCreditAmount } from "@/lib/credits/format";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui-classes";

type CreditPackCardProps = {
  pack: CreditPack;
};

export function CreditPackCard({ pack }: CreditPackCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    clientSecret: string;
    sessionId: string;
  } | null>(null);

  async function handlePurchase() {
    if (loading || paymentModal) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createCreditCheckoutSession(pack.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPaymentModal({
        clientSecret: result.clientSecret,
        sessionId: result.sessionId,
      });
    } catch (err) {
      console.error("[CreditPackCard] hiba:", err);
      setError("Váratlan hiba történt. Próbáld újra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <article
        className={`${cardClassName} relative flex flex-col p-6 ${
          pack.featured
            ? "border-amber-500/50 ring-1 ring-amber-500/30"
            : ""
        }`}
      >
        {pack.featured && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-zinc-900">
            Ajánlott
          </span>
        )}

        <div className="text-center">
          <span className="text-3xl" aria-hidden>
            {pack.emoji}
          </span>
          <h3 className="mt-3 text-xl font-bold text-zinc-50">
            {pack.name}
          </h3>
          <p className="mt-2 text-3xl font-black text-amber-400">
            {formatCreditAmount(pack.credits)}
            <span className="ml-1 text-base font-semibold text-zinc-400">
              kredit
            </span>
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-200">
            {pack.priceEur} EUR
          </p>
          <p className="mt-3 text-sm text-zinc-500">{pack.description}</p>
        </div>

        <button
          type="button"
          onClick={handlePurchase}
          disabled={loading || Boolean(paymentModal)}
          className={`mt-6 w-full ${btnPrimaryClassName}`}
        >
          {loading ? "Indítás…" : "Vásárlás"}
        </button>

        {error && (
          <p className="mt-2 text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </article>

      {paymentModal && (
        <ContactPaymentModal
          bidId="credit-purchase"
          jobTitle={`${pack.name} – ${pack.credits} kredit`}
          craftsmanName={`${pack.priceEur} EUR`}
          clientSecret={paymentModal.clientSecret}
          checkoutSessionId={paymentModal.sessionId}
          onClose={() => setPaymentModal(null)}
          onSuccess={() => {
            setPaymentModal(null);
            window.location.href = "/szaki/kreditek?purchased=1";
          }}
          onPaymentConfirmed={async (sessionId) => {
            await completeCreditPurchaseAfterCheckout(sessionId, pack.id);
          }}
          title={`${pack.name} csomag`}
          description={`${pack.credits} kredit hozzáadása az egyenlegedhez.`}
          submitLabel="Fizetés"
          pollUnlock={async () => true}
        />
      )}
    </>
  );
}
