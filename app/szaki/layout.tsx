import { Suspense } from "react";
import { CraftsmanOnboardingBar } from "@/components/craftsman/craftsman-onboarding-bar";
import { CraftsmanNav } from "@/components/layout/craftsman-nav";
import { getCraftsmanOnboardingStatus } from "@/lib/craftsman/onboarding";
import { PushNotificationPrompt } from "@/components/push/push-notification-prompt";
import { PioneerZoneFromUrl } from "@/components/zone/pioneer-zone-from-url";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanCreditBalance } from "@/lib/credits/balance";
import { getCraftsmanNavCounts } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function SzakiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireCraftsman("/szaki");
  const [counts, credits, onboarding] = await Promise.all([
    getCraftsmanNavCounts(user.id),
    getCraftsmanCreditBalance(user.id),
    getCraftsmanOnboardingStatus(user.id),
  ]);

  return (
    <>
      <CraftsmanNav counts={counts} credits={credits} />
      <CraftsmanOnboardingBar status={onboarding} />
      <PushNotificationPrompt userId={user.id} />
      <Suspense fallback={null}>
        <PioneerZoneFromUrl />
      </Suspense>
      {children}
    </>
  );
}
