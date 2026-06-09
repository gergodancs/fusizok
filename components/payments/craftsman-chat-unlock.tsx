"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  createCraftsmanChatCheckoutSession,
  pollCraftsmanChatUnlock,
} from "@/app/actions/create-craftsman-chat-checkout";
import { ContactPaymentModal } from "@/components/payments/contact-payment-modal";
import { btnPrimaryClassName } from "@/lib/ui-classes";

type CraftsmanChatUnlockProps = {
  bidId: string;
  conversationId: string;
  jobTitle: string;
};

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden
    />
  );
}

export function CraftsmanChatUnlock({
  bidId,
  conversationId,
  jobTitle,
}: CraftsmanChatUnlockProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    clientSecret: string;
  } | null>(null);

  const handleUnlock = useCallback(async () => {
    if (loading || paymentModal) return;

    setLoading(true);
    setError(null);

    try {
      const checkout = await createCraftsmanChatCheckoutSession(
        bidId,
        conversationId,
      );

      if (!checkout.ok) {
        setError(checkout.error);
        setLoading(false);
        return;
      }

      setPaymentModal({ clientSecret: checkout.clientSecret });
      setLoading(false);
    } catch (err) {
      console.error("[CraftsmanChatUnlock] hiba:", err);
      setError("Váratlan hiba történt.");
      setLoading(false);
    }
  }, [bidId, conversationId, loading, paymentModal]);

  const handlePaymentSuccess = useCallback(async () => {
    setPaymentModal(null);

    for (let i = 0; i < 15; i += 1) {
      const result = await pollCraftsmanChatUnlock(bidId);
      if (result.ok && result.unlocked) {
        router.refresh();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setError("A fizetés sikeres, de az aktiválás még folyamatban. Frissítsd az oldalt.");
  }, [bidId, router]);

  return (
    <>
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-medium text-amber-300">
          Az ingyenes kapcsolatfelvételeid elfogytak.
        </p>
        <p className="mt-1 text-sm text-amber-200/80">
          Látod a megrendelő üzenetét, de válaszolni csak a chat díj kifizetése
          után tudsz.
        </p>
        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading || Boolean(paymentModal)}
          className={`mt-3 flex items-center justify-center gap-2 ${btnPrimaryClassName}`}
        >
          {loading ? (
            <>
              <Spinner />
              Fizetés indítása…
            </>
          ) : (
            "Válaszadás aktiválása (fizetés)"
          )}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {paymentModal && (
        <ContactPaymentModal
          bidId={bidId}
          jobTitle={jobTitle}
          craftsmanName="Chat válasz jogosultság"
          clientSecret={paymentModal.clientSecret}
          onClose={() => setPaymentModal(null)}
          onSuccess={() => void handlePaymentSuccess()}
          title="Válaszadás aktiválása"
          description="Az ingyenes kapcsolatfelvételeid elfogytak. Fizess a válaszadáshoz – Apple Pay, Google Pay és bankkártya is használható."
          submitLabel="Fizetés és válaszadás"
          pollUnlock={async () => {
            const result = await pollCraftsmanChatUnlock(bidId);
            return result.ok && result.unlocked;
          }}
        />
      )}
    </>
  );
}
