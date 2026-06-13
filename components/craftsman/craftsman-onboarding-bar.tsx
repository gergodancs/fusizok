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

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CraftsmanOnboardingChecklist status={status} compact />
      </div>
    </div>
  );
}
