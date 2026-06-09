"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { completeCraftsmanChatPaymentAfterCheckout } from "@/app/actions/create-craftsman-chat-checkout";

type CraftsmanPaymentReturnProps = {
  conversationId: string;
};

export function CraftsmanPaymentReturn({
  conversationId,
}: CraftsmanPaymentReturnProps) {
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
    const bidId = searchParams.get("bid_id");

    if (!sessionId || !bidId) {
      return;
    }

    handledRef.current = true;

    void (async () => {
      await completeCraftsmanChatPaymentAfterCheckout(sessionId, bidId);
      router.replace(`/szaki/uzenetek/${conversationId}`);
      router.refresh();
    })();
  }, [conversationId, router, searchParams]);

  return null;
}
