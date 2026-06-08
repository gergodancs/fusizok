import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserNotificationPayload = {
  userId: string;
  title: string;
  body: string;
  url?: string;
  emailSubject?: string;
  emailHtml?: string;
  tag?: string;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

function configureWebPush() {
  if (!isPushConfigured()) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  return true;
}

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    console.error("E-mail cím lekérdezési hiba:", error?.message);
    return null;
  }

  return data.user.email;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "fusizok.hu <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[e-mail mock]", { to, subject, html });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Resend API hiba:", response.status, text);
  }
}

async function getPushSubscriptions(
  userId: string,
): Promise<PushSubscriptionRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("user_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("Push előfizetések lekérdezési hiba:", error.message);
    return [];
  }

  return (data ?? []) as PushSubscriptionRow[];
}

async function sendPushNotifications(
  userId: string,
  payload: UserNotificationPayload,
): Promise<void> {
  if (!configureWebPush()) {
    console.info("[push mock]", {
      userId,
      title: payload.title,
      body: payload.body,
      url: payload.url,
    });
    return;
  }

  const subscriptions = await getPushSubscriptions(userId);
  if (!subscriptions.length) return;

  const admin = createAdminClient();
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? getAppUrl(),
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
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await admin
            ?.from("user_push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }

        console.error("Push küldési hiba:", err);
      }
    }),
  );
}

/**
 * Központi értesítő: e-mail + Web Push a megadott felhasználónak.
 * Hibák esetén nem dob – a fő folyamat ne álljon meg.
 */
export async function notifyUser(
  payload: UserNotificationPayload,
): Promise<void> {
  try {
    const email = await getUserEmail(payload.userId);
    const subject = payload.emailSubject ?? payload.title;
    const html =
      payload.emailHtml ??
      `<p>${payload.body}</p><p><a href="${payload.url ?? getAppUrl()}">Megnyitás a fusizok.hu-n</a></p>`;

    const tasks: Promise<void>[] = [
      sendPushNotifications(payload.userId, payload),
    ];

    if (email) {
      tasks.push(sendEmail(email, subject, html));
    } else {
      console.info("[e-mail skip – nincs cím]", payload.userId, subject);
    }

    await Promise.all(tasks);
  } catch (err) {
    console.error("Értesítés küldési hiba:", err);
  }
}
