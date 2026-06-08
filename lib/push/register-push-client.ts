import { savePushSubscription } from "@/app/actions/push-subscription";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

export type RegisterPushResult = {
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  saved: boolean;
  needsLogin: boolean;
  error?: string;
};

export async function registerPushOnClient(
  saveToServer: boolean,
): Promise<RegisterPushResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      permission: "unsupported",
      saved: false,
      needsLogin: false,
      error: "Csak böngészőben érhető el.",
    };
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return {
      ok: false,
      permission: "unsupported",
      saved: false,
      needsLogin: false,
      error: "A böngésződ nem támogatja a push értesítéseket.",
    };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    const keyResponse = await fetch("/api/push/vapid-public-key");
    if (!keyResponse.ok) {
      return {
        ok: false,
        permission: Notification.permission,
        saved: false,
        needsLogin: false,
        error: "A push szolgáltatás nincs konfigurálva.",
      };
    }

    const { publicKey } = (await keyResponse.json()) as { publicKey: string };

    let permission: NotificationPermission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return {
        ok: false,
        permission,
        saved: false,
        needsLogin: false,
        error:
          permission === "denied"
            ? "Az értesítések le vannak tiltva. Engedélyezd a böngésző beállításaiban."
            : "Az értesítések nincsenek engedélyezve.",
      };
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return {
        ok: false,
        permission,
        saved: false,
        needsLogin: false,
        error: "Az előfizetés létrehozása sikertelen.",
      };
    }

    if (!saveToServer) {
      return {
        ok: true,
        permission,
        saved: false,
        needsLogin: true,
      };
    }

    const saveResult = await savePushSubscription({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      userAgent: navigator.userAgent,
    });

    if (!saveResult.ok) {
      return {
        ok: true,
        permission,
        saved: false,
        needsLogin: saveResult.error === "Bejelentkezés szükséges.",
        error: saveResult.error,
      };
    }

    return {
      ok: true,
      permission,
      saved: true,
      needsLogin: false,
    };
  } catch (err) {
    console.error("Push regisztráció hiba:", err);
    return {
      ok: false,
      permission: Notification.permission ?? "unsupported",
      saved: false,
      needsLogin: false,
      error: "Hiba történt az értesítések bekapcsolásakor.",
    };
  }
}
