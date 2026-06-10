import webpush from "web-push";
import { sendEmail, type EmailFromType } from "@/lib/email";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserNotificationPayload = {
  userId: string;
  title: string;
  body: string;
  url?: string;
  emailSubject?: string;
  emailHtml?: string;
  /** Alapértelmezés: transactional → noreply@fusizok.hu */
  emailFromType?: EmailFromType;
  tag?: string;
};

export type NotifyResult = {
  ok: boolean;
  pushSent: number;
  pushFailed: number;
  emailSent: boolean;
  subscriptionCount: number;
  errors: string[];
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

function configureWebPush(): boolean {
  if (!isPushConfigured()) {
    console.warn(
      "[notify] VAPID kulcsok hiányoznak – push nem küldhető (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT).",
    );
    return false;
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    return true;
  } catch (err) {
    console.error("[notify] VAPID konfigurációs hiba:", err);
    return false;
  }
}

function requireAdminClient() {
  const admin = createAdminClient();
  if (!admin) {
    console.error(
      "[notify] SUPABASE_SERVICE_ROLE_KEY hiányzik – push tokenek és e-mail címek nem olvashatók!",
    );
  }
  return admin;
}

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = requireAdminClient();
  if (!admin) return null;

  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user?.email) {
      console.error(
        "[notify] E-mail cím lekérdezési hiba:",
        userId,
        error?.message,
      );
      return null;
    }
    console.log("[notify] E-mail cím megtalálva:", userId, data.user.email);
    return data.user.email;
  } catch (err) {
    console.error("[notify] getUserEmail exception:", err);
    return null;
  }
}

async function getPushSubscriptions(
  userId: string,
): Promise<PushSubscriptionRow[]> {
  const admin = requireAdminClient();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from("user_push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      console.error(
        "[notify] Push előfizetések lekérdezési hiba:",
        userId,
        error.message,
      );
      return [];
    }

    console.log(
      "[notify] Push előfizetések:",
      userId,
      (data ?? []).length,
      "db",
    );
    return (data ?? []) as PushSubscriptionRow[];
  } catch (err) {
    console.error("[notify] getPushSubscriptions exception:", err);
    return [];
  }
}

async function sendPushNotifications(
  userId: string,
  payload: UserNotificationPayload,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  if (!configureWebPush()) {
    console.info("[notify] [push mock – VAPID nincs konfigurálva]", {
      userId,
      title: payload.title,
      body: payload.body,
    });
    return { sent: 0, failed: 0, errors: ["VAPID nincs konfigurálva"] };
  }

  const subscriptions = await getPushSubscriptions(userId);
  if (!subscriptions.length) {
    const msg = `Nincs push előfizetés a userhez: ${userId}`;
    console.warn("[notify]", msg);
    return { sent: 0, failed: 0, errors: [msg] };
  }

  const admin = createAdminClient();
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? getAppBaseUrl(),
    tag: payload.tag,
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload,
        );
        sent += 1;
        console.log("[notify] Push elküldve:", userId, sub.endpoint.slice(0, 40));
      } catch (err: unknown) {
        failed += 1;
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : null;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : String(err);

        console.error(
          "[notify] Push küldési hiba:",
          userId,
          statusCode,
          message,
        );
        errors.push(message);

        if ((statusCode === 404 || statusCode === 410) && admin) {
          await admin
            .from("user_push_subscriptions")
            .delete()
            .eq("id", sub.id);
          console.log("[notify] Lejárt előfizetés törölve:", sub.id);
        }
      }
    }),
  );

  return { sent, failed, errors };
}

/**
 * Központi értesítő: e-mail + Web Push a megadott felhasználónak.
 */
export async function notifyUser(
  payload: UserNotificationPayload,
): Promise<NotifyResult> {
  const result: NotifyResult = {
    ok: false,
    pushSent: 0,
    pushFailed: 0,
    emailSent: false,
    subscriptionCount: 0,
    errors: [],
  };

  console.log("[notify] === Értesítés indítása ===", {
    userId: payload.userId,
    title: payload.title,
    body: payload.body.slice(0, 80),
  });

  try {
    const subscriptions = await getPushSubscriptions(payload.userId);
    result.subscriptionCount = subscriptions.length;

    const pushResult = await sendPushNotifications(payload.userId, payload);
    result.pushSent = pushResult.sent;
    result.pushFailed = pushResult.failed;
    result.errors.push(...pushResult.errors);

    const email = await getUserEmail(payload.userId);
    const subject = payload.emailSubject ?? payload.title;
    const html =
      payload.emailHtml ??
      `<p>${payload.body}</p><p><a href="${payload.url ?? getAppBaseUrl()}">Megnyitás a Fusizók-on</a></p>`;

    if (email) {
      const emailResult = await sendEmail({
        to: email,
        subject,
        html,
        fromType: payload.emailFromType ?? "transactional",
      });
      result.emailSent = emailResult.ok;
      if (!emailResult.ok && emailResult.error) {
        result.errors.push(emailResult.error);
      }
    } else {
      result.errors.push("Nincs e-mail cím vagy hiányzik a service role kulcs");
    }

    result.ok = result.pushSent > 0 || result.emailSent;

    console.log("[notify] === Értesítés kész ===", result);
    return result;
  } catch (err) {
    console.error("[notify] notifyUser exception:", err);
    result.errors.push(err instanceof Error ? err.message : String(err));
    return result;
  }
}
