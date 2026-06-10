"use client";

import { useEffect } from "react";
import { registerPushOnClient } from "@/lib/push/register-push-client";

type PushNotificationPromptProps = {
  userId: string;
};

export function PushNotificationPrompt({ userId }: PushNotificationPromptProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return;

    async function syncPushSubscription() {
      const keyResponse = await fetch("/api/push/vapid-public-key");
      if (!keyResponse.ok) {
        return;
      }

      const result = await registerPushOnClient(true);

      if (!result.ok && result.error) {
        console.info("[PushNotificationPrompt] Push szinkron kihagyva:", result.error);
        return;
      }

      if (!result.saved && result.ok && Notification.permission === "granted") {
        console.info(
          "[PushNotificationPrompt] Engedély megvan, token mentés:",
          result.error ?? "nincs bejelentkezve vagy szerver hiba",
        );
      }
    }

    void syncPushSubscription();
  }, [userId]);

  return null;
}
