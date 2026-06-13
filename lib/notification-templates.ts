import { getBidCreditCostRange } from "@/lib/constants/categories";
import { CRAFTSMAN_SIGNUP_CREDITS } from "@/lib/credits/constants";
import { formatCreditAmount } from "@/lib/credits/format";
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

function buildCraftsmanWelcomeBody(fullName: string): string {
  const signupCredits = formatCreditAmount(CRAFTSMAN_SIGNUP_CREDITS);
  const { min, max } = getBidCreditCostRange();

  return `<p>Kedves <strong>${escapeHtml(fullName)}</strong>,</p>
<p>Örülünk, hogy fusizóként csatlakoztál a <strong>Fusizok.hu</strong> béta közösségéhez. Köszönjük, hogy segítesz kipróbálni a platformot!</p>

<div style="margin: 20px 0; padding: 16px 18px; background: #27272a; border: 1px solid #3f3f46; border-radius: 12px;">
  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #fbbf24;">Béta induló egyenleg</p>
  <p style="margin: 0; color: #fafafa;">
    <strong>${signupCredits} induló kreditet</strong> kaptál.
    A tesztidőszak alatt <strong>nem kell fizetned</strong>: ha elfogynak a kredited, automatikusan újratöltjük őket, hogy szabadon pályázhass.
  </p>
</div>

<div style="margin: 20px 0; padding: 16px 18px; background: #27272a; border: 1px solid #3f3f46; border-radius: 12px;">
  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #fbbf24;">Értesítések a munkáidról</p>
  <p style="margin: 0; color: #fafafa;">
    Ha kitöltötted a profilodat (tevékenység és munkaterület), <strong>emailben azonnal értesítünk</strong>, amikor a körzetedben új hirdetés kerül fel – így nem maradsz le a neked való munkákról.
  </p>
</div>

<p>A platform jelenleg béta tesztidőszakban van, és aktívan népszerűsítjük az oldalt. A munkák száma folyamatosan nőni fog – <strong>köszönjük a türelmedet</strong>, amíg a közösség összeáll!</p>

<p>Pályázáskor látni fogod a kreditdíjat (kategóriánként kb. ${formatCreditAmount(min)}–${formatCreditAmount(max)} kredit lesz majd normál üzemben). Most az induló egyenlegeddel szabadon próbálkozhatsz.</p>

<p style="margin: 20px 0 8px; font-weight: 700; color: #fafafa;">Első lépések:</p>
<ol style="margin: 0; padding-left: 20px; color: #d4d4d8;">
  <li style="margin-bottom: 8px;"><strong>Profil kitöltése</strong> – válaszd ki a tevékenységeidet és a szolgáltatási körzetedet.</li>
  <li style="margin-bottom: 8px;"><strong>Munkák böngészése</strong> – nézd meg a környékeden feladott feladatokat.</li>
  <li style="margin-bottom: 8px;"><strong>Első pályázat</strong> – küldj árat, határidőt és rövid üzenetet.</li>
</ol>

<p style="margin-top: 20px;">Ha elakadsz vagy visszajelzésed van, írj nekünk: <a href="mailto:info@fusizok.hu" style="color: #f59e0b;">info@fusizok.hu</a></p>`;
}

function buildClientWelcomeBody(fullName: string): string {
  return `<p>Kedves <strong>${escapeHtml(fullName)}</strong>,</p>
<p>Örülünk, hogy megrendelőként csatlakoztál a <strong>Fusizok.hu</strong>-hoz.</p>

<div style="margin: 20px 0; padding: 16px 18px; background: #27272a; border: 1px solid #3f3f46; border-radius: 12px;">
  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #fbbf24;">Ingyenes munkafeladás</p>
  <p style="margin: 0; color: #fafafa;">
    A munka feladása <strong>ingyenes</strong>. Írd le, miben kell segítség – a környék fusizói pályáznak rád árral és határidővel.
  </p>
</div>

<p style="margin: 20px 0 8px; font-weight: 700; color: #fafafa;">Így működik:</p>
<ol style="margin: 0; padding-left: 20px; color: #d4d4d8;">
  <li style="margin-bottom: 8px;">Leírod a feladatot, helyszínt és kategóriát.</li>
  <li style="margin-bottom: 8px;">Pályázatok érkeznek – összehasonlíthatod az ajánlatokat.</li>
  <li style="margin-bottom: 8px;">Kiválasztod a legjobb fusizót, majd chatben egyeztettek.</li>
</ol>

<p style="margin-top: 20px;">Kérdés esetén írj: <a href="mailto:info@fusizok.hu" style="color: #f59e0b;">info@fusizok.hu</a></p>`;
}

export function buildWelcomeEmailHtml(params: {
  fullName: string;
  role: "client" | "craftsman";
  actionUrl: string;
  /** @deprecated Használd az actionUrl mezőt. */
  loginUrl?: string;
}): string {
  const actionUrl = params.actionUrl || params.loginUrl || `${getAppBaseUrl()}/login`;
  const bodyHtml =
    params.role === "craftsman"
      ? buildCraftsmanWelcomeBody(params.fullName)
      : buildClientWelcomeBody(params.fullName);

  const title =
    params.role === "craftsman"
      ? `Üdv fusizóként, ${params.fullName}!`
      : `Üdvözlünk, ${params.fullName}!`;

  const actionLabel =
    params.role === "craftsman"
      ? "Munkák böngészése"
      : "Munka feladása";

  return emailLayout(title, bodyHtml, actionUrl, actionLabel);
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
