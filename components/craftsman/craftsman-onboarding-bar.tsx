"use client";

import { usePathname } from "next/navigation";
import { CraftsmanOnboardingChecklist } from "@/components/craftsman/craftsman-onboarding-checklist";
import type { CraftsmanOnboardingStatus } from "@/lib/craftsman/onboarding";

type CraftsmanOnboardingBarProps = {
  status: CraftsmanOnboardingStatus;
};

export function CraftsmanOnboardingBar({ status }: CraftsmanOnboardingBarProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/szaki/profil")) {
    return null;
  }

  return <CraftsmanOnboardingChecklist status={status} compact />;
}
