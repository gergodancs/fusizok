"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pollContactActivation } from "@/app/actions/share-contact";

export function PaymentReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const isReturn = searchParams.get("payment_return") === "1";
    const bidId = searchParams.get("bid_id");

    if (!isReturn || !bidId) return;

    let cancelled = false;

    async function handleReturn() {
      setMessage("Fizetés ellenőrzése…");

      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (cancelled) return;

        const result = await pollContactActivation(bidId!);
        if (result.ok && result.contactShared) {
          router.replace(`/lakos/uzenetek/${result.conversationId}`);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setMessage(
          "A fizetés feldolgozása folyamatban. Frissítsd az oldalt néhány másodperc múlva.",
        );
        router.replace("/lakos/ajanlatok");
      }
    }

    void handleReturn();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (!message) return null;

  return (
    <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
      {message}
    </p>
  );
}
