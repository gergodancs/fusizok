import { getAppBaseUrl } from "@/lib/stripe/config";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailLayout(
  title: string,
  bodyHtml: string,
  actionUrl: string,
  actionLabel = "Megnyitás a Fusizok.hu-n",
): string {
  const appUrl = getAppBaseUrl();
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background: #09090b; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #e4e4e7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #09090b; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #18181b; border: 1px solid #3f3f46; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 24px 28px; background: linear-gradient(135deg, #1c1917 0%, #27272a 100%); border-bottom: 1px solid #3f3f46;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #f59e0b;">Fusizok.hu</p>
              <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #fafafa; line-height: 1.3;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px; font-size: 15px; color: #d4d4d8;">
              ${bodyHtml}
              <p style="margin: 28px 0 0;">
                <a href="${actionUrl}" style="display: inline-block; background: #f59e0b; color: #18181b; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
                  ${escapeHtml(actionLabel)}
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 28px 24px; border-top: 1px solid #3f3f46; font-size: 12px; color: #71717a;">
              <p style="margin: 0;">Ez egy automatikus értesítés a <a href="${appUrl}" style="color: #f59e0b; text-decoration: none;">fusizok.hu</a> platformról.</p>
              <p style="margin: 8px 0 0;">Ha nem te kezdeményezted, kérjük, hagyd figyelmen kívül ezt az üzenetet.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildWelcomeEmailHtml(params: {
  fullName: string;
  role: "client" | "craftsman";
  loginUrl: string;
}): string {
  const roleText =
    params.role === "craftsman"
      ? "fusizóként böngészhetsz munkákat, pályázhatsz kredittal, és chatben egyezhetsz meg a megrendelőkkel. A béta időszakban 100 induló kreditet kapsz az első pályázataidhoz."
      : "megrendelőként feladhatsz munkát, összehasonlíthatod a pályázatokat, és biztonságosan chatelhetsz a szakikkal.";

  return emailLayout(
    `Üdvözlünk, ${params.fullName}!`,
    `<p>Örülünk, hogy csatlakoztál a <strong>Fusizok.hu</strong> közösségéhez.</p>
<p>Fiókod típusa alapján ${roleText}</p>
<p>Ha még nem tetted meg, érdemes kitölteni a profilodat, hogy a legjobb találatokat kapd.</p>`,
    params.loginUrl,
    "Belépés a Fusizok.hu-ra",
  );
}

export function buildNewMessageEmailHtml(params: {
  senderName: string;
  preview: string;
  chatUrl: string;
}): string {
  return emailLayout(
    "Új üzeneted érkezett",
    `<p><strong>${escapeHtml(params.senderName)}</strong> üzenetet küldött neked:</p>
<blockquote style="margin: 16px 0; padding: 14px 16px; border-left: 4px solid #f59e0b; background: #27272a; border-radius: 0 8px 8px 0; color: #fafafa;">
  ${escapeHtml(params.preview)}
</blockquote>
<p>Válaszolj az alkalmazásban, amint tudsz.</p>`,
    params.chatUrl,
    "Chat megnyitása",
  );
}

export function buildBidRejectedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  activityUrl: string;
}): string {
  return emailLayout(
    "Pályázatod elutasítva",
    `<p><strong>${escapeHtml(params.clientName)}</strong> elutasította a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkára adott pályázatodat.</p>
<p>Ne csüggedj – böngéssz tovább a többi elérhető munka között!</p>`,
    params.activityUrl,
    "További munkák",
  );
}

export function buildBidAcceptedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  chatUrl: string;
  paymentRequired?: boolean;
}): string {
  return emailLayout(
    "Ajánlat elfogadva!",
    `<p><strong>Gratulálunk!</strong> ${escapeHtml(params.clientName)} elfogadta az ajánlatodat a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkára, és elindult a chat!</p>
<p>Nézd meg az üzeneteket, és egyeztess a részletekről.</p>`,
    params.chatUrl,
    "Chat megnyitása",
  );
}

export function buildNewBidEmailHtml(params: {
  craftsmanName: string;
  jobTitle: string;
  offersUrl: string;
}): string {
  return emailLayout(
    "Új pályázat érkezett",
    `<p><strong>${escapeHtml(params.craftsmanName)}</strong> pályázott a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkádra.</p>
<p>Nézd meg az ajánlat részleteit, és válassz a legjobb szaki közül.</p>`,
    params.offersUrl,
    "Ajánlatok megtekintése",
  );
}

export function buildChatUnlockedEmailHtml(params: {
  jobTitle: string;
  chatUrl: string;
}): string {
  return emailLayout(
    "Chat válaszadás aktiválva",
    `<p>Sikeres fizetés – most már válaszolhatsz a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkához tartozó chatben.</p>`,
    params.chatUrl,
    "Chat megnyitása",
  );
}

export function buildNewNearbyJobEmailHtml(params: {
  jobTitle: string;
  locationLabel: string;
  category: string;
  jobUrl: string;
}): string {
  return emailLayout(
    "Új munka a közeledben",
    `<p>Új meló érkezett, ami passzol a profilodhoz:</p>
<ul style="margin: 16px 0; padding-left: 20px; color: #e4e4e7;">
  <li style="margin-bottom: 6px;"><strong>${escapeHtml(params.jobTitle)}</strong></li>
  <li style="margin-bottom: 6px;">Kategória: ${escapeHtml(params.category)}</li>
  <li>Helyszín: ${escapeHtml(params.locationLabel)}</li>
</ul>
<p>Böngészd a részleteket, és pályázz, ha érdekel!</p>`,
    params.jobUrl,
    "Munka megtekintése",
  );
}

export function buildJobCompletedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  activityUrl: string;
}): string {
  return emailLayout(
    "Munka lezárva",
    `<p><strong>${escapeHtml(params.clientName)}</strong> késznek jelölte a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkát.</p>
<p>Ha minden rendben, értékeld a közös munkát az alkalmazásban.</p>`,
    params.activityUrl,
    "Aktivitás megnyitása",
  );
}
