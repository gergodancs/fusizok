import { savePushSubscription } from "@/app/actions/push-subscription";
import { decodeVapidPublicKey } from "@/lib/push/vapid";

export type RegisterPushResult = {
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  saved: boolean;
  needsLogin: boolean;
  subscriptionId?: string;
  error?: string;
};

async function subscribeWithKey(
  registration: ServiceWorkerRegistration,
  applicationServerKey: Uint8Array,
): Promise<PushSubscription> {
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    try {
      const json = existing.toJSON();
      if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        return existing;
      }
    } catch {
      await existing.unsubscribe();
    }
  }

  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });
  } catch (err) {
    const stale = await registration.pushManager.getSubscription();
    if (stale) {
      await stale.unsubscribe();
    }

    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });
  }
}

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
    const keyResponse = await fetch("/api/push/vapid-public-key");
    if (!keyResponse.ok) {
      return {
        ok: false,
        permission: Notification.permission,
        saved: false,
        needsLogin: false,
        error: "A push értesítések nincsenek konfigurálva a szerveren.",
      };
    }

    const { publicKey } = (await keyResponse.json()) as { publicKey: string };
    const applicationServerKey = decodeVapidPublicKey(publicKey);

    if (!applicationServerKey) {
      console.warn(
        "[push-register] Érvénytelen VAPID kulcs – állítsd be a NEXT_PUBLIC_VAPID_PUBLIC_KEY és VAPID_PRIVATE_KEY párost (node scripts/generate-vapid-keys.mjs).",
      );
      return {
        ok: false,
        permission: Notification.permission,
        saved: false,
        needsLogin: false,
        error: "A push értesítések nincsenek megfelelően konfigurálva.",
      };
    }

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

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

    const subscription = await subscribeWithKey(
      registration,
      applicationServerKey,
    );
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
      subscriptionId: saveResult.subscriptionId,
    };
  } catch (err) {
    const isInvalidKey =
      err instanceof DOMException && err.name === "InvalidAccessError";

    if (isInvalidKey) {
      console.warn(
        "[push-register] VAPID kulcs elutasítva a böngésző által – ellenőrizd, hogy a public és private key pár együtt lett-e generálva.",
      );
      return {
        ok: false,
        permission: Notification.permission ?? "unsupported",
        saved: false,
        needsLogin: false,
        error: "A push értesítések nincsenek megfelelően konfigurálva.",
      };
    }

    console.error("[push-register] Exception:", err);
    return {
      ok: false,
      permission: Notification.permission ?? "unsupported",
      saved: false,
      needsLogin: false,
      error: "Hiba történt az értesítések bekapcsolásakor.",
    };
  }
}
