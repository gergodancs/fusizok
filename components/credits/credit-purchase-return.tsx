"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { completeCreditPurchaseAfterCheckout } from "@/app/actions/create-credit-checkout";

export function CreditPurchaseReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    if (searchParams.get("payment_return") !== "1") {
      return;
    }

    const sessionId = searchParams.get("session_id");
    const pack = searchParams.get("pack");

    if (!sessionId || !pack) {
      return;
    }

    handledRef.current = true;

    void (async () => {
      await completeCreditPurchaseAfterCheckout(sessionId, pack);
      router.replace("/szaki/kreditek?purchased=1");
      router.refresh();
    })();
  }, [router, searchParams]);

  return null;
}
