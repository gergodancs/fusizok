"use client";

import { useEffect, useRef } from "react";
import { registerPushOnClient } from "@/lib/push/register-push-client";

type PushNotificationPromptProps = {
  userId: string;
};

export function PushNotificationPrompt({ userId }: PushNotificationPromptProps) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return;

    attemptedRef.current = true;
    void registerPushOnClient(true);
  }, [userId]);

  return null;
}
