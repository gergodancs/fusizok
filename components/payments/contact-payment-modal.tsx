"use client";

import { loadStripe, type StripeCheckoutElementsSdk } from "@stripe/stripe-js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { pollContactActivation } from "@/app/actions/share-contact";
import { btnPrimaryClassName } from "@/lib/ui-classes";

type ContactPaymentModalProps = {
  bidId: string;
  jobTitle: string;
  craftsmanName: string;
  clientSecret: string;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden
    />
  );
}

async function waitForActivation(
  bidId: string,
  maxAttempts = 15,
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await pollContactActivation(bidId);
    if (result.ok && result.contactShared) {
      return result.conversationId;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return null;
}

export function ContactPaymentModal({
  bidId,
  jobTitle,
  craftsmanName,
  clientSecret,
  onClose,
  onSuccess,
}: ContactPaymentModalProps) {
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const checkoutSdkRef = useRef<StripeCheckoutElementsSdk | null>(null);
  const mountedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initCheckout() {
      if (!clientSecret || mountedRef.current) return;

      try {
        const stripe = await stripePromise;
        if (!stripe || cancelled) return;

        const checkout = stripe.initCheckoutElementsSdk({
          clientSecret,
          elementsOptions: {
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#f59e0b",
                colorBackground: "#18181b",
                colorText: "#f4f4f5",
                colorDanger: "#f87171",
                borderRadius: "12px",
              },
            },
          },
        });

        checkoutSdkRef.current = checkout;

        const loadResult = await checkout.loadActions();
        if (loadResult.type !== "success") {
          setError(
            loadResult.error.message ??
              "A fizetési űrlap betöltése sikertelen.",
          );
          setLoading(false);
          return;
        }

        if (paymentElementRef.current && !mountedRef.current) {
          const paymentElement = checkout.createPaymentElement({
            layout: { type: "tabs" },
          });
          paymentElement.mount(paymentElementRef.current);
          mountedRef.current = true;
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("[ContactPaymentModal] initCheckout hiba:", err);
        if (!cancelled) {
          setError("A fizetési űrlap inicializálása sikertelen.");
          setLoading(false);
        }
      }
    }

    void initCheckout();

    return () => {
      cancelled = true;
    };
  }, [clientSecret]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (paying || loading) return;

      const checkout = checkoutSdkRef.current;
      if (!checkout) {
        setError("A fizetési űrlap még nem áll készen.");
        return;
      }

      setPaying(true);
      setError(null);

      try {
        const loadResult = await checkout.loadActions();
        if (loadResult.type !== "success") {
          setError(
            loadResult.error.message ?? "A fizetés indítása sikertelen.",
          );
          setPaying(false);
          return;
        }

        const confirmResult = await loadResult.actions.confirm();

        if (confirmResult.type === "error") {
          setError(confirmResult.error.message ?? "A fizetés sikertelen.");
          setPaying(false);
          return;
        }

        const conversationId = await waitForActivation(bidId);
        if (!conversationId) {
          setError(
            "A fizetés sikeres, de a chat aktiválása még folyamatban. Frissítsd az oldalt pár másodperc múlva.",
          );
          setPaying(false);
          return;
        }

        onSuccess(conversationId);
      } catch (err) {
        console.error("[ContactPaymentModal] confirm hiba:", err);
        setError("Váratlan hiba történt a fizetés során.");
        setPaying(false);
      }
    },
    [bidId, loading, onSuccess, paying],
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="payment-modal-title"
              className="text-lg font-bold text-zinc-100"
            >
              Kapcsolat megosztása
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {jobTitle} – {craftsmanName}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              A szaki ingyenes kreditjei elfogytak. A chat megnyitásához egyszeri
              díj szükséges. Apple Pay, Google Pay és bankkártya is
              használható.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="rounded-lg px-2 py-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            ref={paymentElementRef}
            className={`min-h-[120px] rounded-xl border border-zinc-700 bg-zinc-950/50 p-3 ${loading ? "opacity-40" : ""}`}
          />

          {loading && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <Spinner />
              Fizetési űrlap betöltése…
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || paying}
            className={`flex w-full items-center justify-center gap-2 ${btnPrimaryClassName}`}
          >
            {paying ? (
              <>
                <Spinner />
                Fizetés feldolgozása…
              </>
            ) : (
              "Fizetés és chat indítása"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
