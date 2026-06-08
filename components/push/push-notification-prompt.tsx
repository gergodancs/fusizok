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
      const result = await registerPushOnClient(true);
      console.log("[PushNotificationPrompt] Regisztráció:", userId, result);

      if (!result.saved && result.ok && Notification.permission === "granted") {
        console.warn(
          "[PushNotificationPrompt] Engedély megvan, de a token nincs elmentve:",
          result.error,
        );
      }
    }

    void syncPushSubscription();
  }, [userId]);

  return null;
}
