import { Suspense } from "react";
import { CraftsmanOnboardingBar } from "@/components/craftsman/craftsman-onboarding-bar";
import { CraftsmanNav } from "@/components/layout/craftsman-nav";
import { PushNotificationPrompt } from "@/components/push/push-notification-prompt";
import { PioneerZoneFromUrl } from "@/components/zone/pioneer-zone-from-url";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanLayoutSnapshot } from "@/lib/nav/snapshot";

export const dynamic = "force-dynamic";

export default async function SzakiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireCraftsman("/szaki");
  const { counts, credits, onboarding } = await getCraftsmanLayoutSnapshot();

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
