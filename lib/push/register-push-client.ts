import { savePushSubscription } from "@/app/actions/push-subscription";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

export type RegisterPushResult = {
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  saved: boolean;
  needsLogin: boolean;
  subscriptionId?: string;
  error?: string;
};

async function subscribeWithVapid(
  registration: ServiceWorkerRegistration,
  publicKey: string,
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
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  } catch (err) {
    console.warn(
      "[push-register] Első előfizetés sikertelen, újrapróbálás:",
      err,
    );
    const stale = await registration.pushManager.getSubscription();
    if (stale) await stale.unsubscribe();
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
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
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    const keyResponse = await fetch("/api/push/vapid-public-key");
    if (!keyResponse.ok) {
      console.error("[push-register] VAPID API hiba:", keyResponse.status);
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

    console.log("[push-register] Notification permission:", permission);

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

    const subscription = await subscribeWithVapid(registration, publicKey);
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

    console.log("[push-register] Push subscription létrejött:", json.endpoint);

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

    console.log("[push-register] Szerver mentés eredmény:", saveResult);

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
