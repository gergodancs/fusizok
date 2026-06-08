"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createContactCheckoutSession } from "@/app/actions/create-contact-checkout";
import { initiateShareContact } from "@/app/actions/share-contact";
import { ContactPaymentModal } from "@/components/payments/contact-payment-modal";
import { btnPrimaryClassName } from "@/lib/ui-classes";

type ShareContactButtonProps = {
  bidId: string;
  jobTitle: string;
  craftsmanName: string;
  variant?: "primary" | "resume";
};

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden
    />
  );
}

export function ShareContactButton({
  bidId,
  jobTitle,
  craftsmanName,
  variant = "primary",
}: ShareContactButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    clientSecret: string;
  } | null>(null);

  const handleShare = useCallback(async () => {
    if (loading || paymentModal) return;

    setLoading(true);
    setError(null);

    try {
      const result = await initiateShareContact(bidId);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (
        result.outcome === "activated" ||
        result.outcome === "already_active"
      ) {
        router.push(`/lakos/uzenetek/${result.conversationId}`);
        return;
      }

      const checkout = await createContactCheckoutSession(bidId);
      if (!checkout.ok) {
        setError(checkout.error);
        setLoading(false);
        return;
      }

      setPaymentModal({ clientSecret: checkout.clientSecret });
      setLoading(false);
    } catch (err) {
      console.error("[ShareContactButton] hiba:", err);
      setError("Váratlan hiba történt. Próbáld újra.");
      setLoading(false);
    }
  }, [bidId, loading, paymentModal, router]);

  const handlePaymentSuccess = useCallback(
    (conversationId: string) => {
      setPaymentModal(null);
      router.push(`/lakos/uzenetek/${conversationId}`);
    },
    [router],
  );

  const label =
    variant === "resume" ? "Fizetés befejezése" : "Kapcsolat megosztása";

  return (
    <>
      <div className="flex-1 space-y-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading || Boolean(paymentModal)}
          className={`flex w-full items-center justify-center gap-2 ${btnPrimaryClassName}`}
        >
          {loading ? (
            <>
              <Spinner />
              Feldolgozás…
            </>
          ) : (
            label
          )}
        </button>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {paymentModal && (
        <ContactPaymentModal
          bidId={bidId}
          jobTitle={jobTitle}
          craftsmanName={craftsmanName}
          clientSecret={paymentModal.clientSecret}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
