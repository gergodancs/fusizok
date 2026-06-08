"use client";

import { useEffect, useRef } from "react";
import { savePushSubscription } from "@/app/actions/push-subscription";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

type PushNotificationPromptProps = {
  userId: string;
};

export function PushNotificationPrompt({ userId }: PushNotificationPromptProps) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    attemptedRef.current = true;

    async function registerPush() {
      try {
        if (Notification.permission === "denied") return;

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        await navigator.serviceWorker.ready;

        const keyResponse = await fetch("/api/push/vapid-public-key");
        if (!keyResponse.ok) return;

        const { publicKey } = (await keyResponse.json()) as {
          publicKey: string;
        };

        let permission: NotificationPermission = Notification.permission;
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") return;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              publicKey,
            ) as BufferSource,
          });
        }

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

        await savePushSubscription({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          userAgent: navigator.userAgent,
        });
      } catch (err) {
        console.error("Push regisztráció hiba:", err);
      }
    }

    void registerPush();
  }, [userId]);

  return null;
}
