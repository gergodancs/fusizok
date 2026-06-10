import {
  buildCraftsmanOnboardingSteps,
  summarizeOnboarding,
  type CraftsmanOnboardingStatus,
} from "@/lib/craftsman/onboarding";
import type { CraftsmanNavCounts, ClientNavCounts } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type CraftsmanLayoutSnapshotRpc = {
  credits?: number;
  nav?: {
    new_open_jobs?: number;
    new_activity?: number;
    unread_messages?: number;
    payment_required?: number;
  };
  onboarding?: {
    has_sub_categories?: boolean;
    has_service_area?: boolean;
    has_bio?: boolean;
    has_avatar?: boolean;
    portfolio_count?: number;
    has_bid?: boolean;
  };
  error?: string;
};

type ClientLayoutSnapshotRpc = {
  unread_messages?: number;
  new_offers?: number;
  error?: string;
};

export type CraftsmanLayoutSnapshot = {
  credits: number;
  counts: CraftsmanNavCounts;
  onboarding: CraftsmanOnboardingStatus;
};

const EMPTY_CRAFTSMAN_COUNTS: CraftsmanNavCounts = {
  newOpenJobs: 0,
  newActivity: 0,
  chatNotifications: 0,
};

const EMPTY_CLIENT_COUNTS: ClientNavCounts = {
  unreadMessages: 0,
  newOffers: 0,
};

function onboardingFromSnapshot(
  data: NonNullable<CraftsmanLayoutSnapshotRpc["onboarding"]>,
): CraftsmanOnboardingStatus {
  return summarizeOnboarding(
    buildCraftsmanOnboardingSteps({
      hasSubCategories: Boolean(data.has_sub_categories),
      hasServiceArea: Boolean(data.has_service_area),
      hasBio: Boolean(data.has_bio),
      hasAvatar: Boolean(data.has_avatar),
      portfolioCount: Number(data.portfolio_count ?? 0),
      hasBid: Boolean(data.has_bid),
    }),
  );
}

export async function getCraftsmanLayoutSnapshot(): Promise<CraftsmanLayoutSnapshot> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_craftsman_layout_snapshot");

  if (error) {
    console.error("[nav] craftsman layout snapshot hiba:", error.message);
    return {
      credits: 0,
      counts: EMPTY_CRAFTSMAN_COUNTS,
      onboarding: summarizeOnboarding(buildCraftsmanOnboardingSteps({
        hasSubCategories: false,
        hasServiceArea: false,
        hasBio: false,
        hasAvatar: false,
        portfolioCount: 0,
        hasBid: false,
      })),
    };
  }

  const snapshot = data as CraftsmanLayoutSnapshotRpc;
  const nav = snapshot.nav ?? {};
  const unread = Number(nav.unread_messages ?? 0);
  const paymentRequired = Number(nav.payment_required ?? 0);

  return {
    credits: Number(snapshot.credits ?? 0),
    counts: {
      newOpenJobs: Number(nav.new_open_jobs ?? 0),
      newActivity: Number(nav.new_activity ?? 0),
      chatNotifications: unread + paymentRequired,
    },
    onboarding: onboardingFromSnapshot(snapshot.onboarding ?? {}),
  };
}

export async function getClientLayoutSnapshot(): Promise<ClientNavCounts> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_client_layout_snapshot");

  if (error) {
    console.error("[nav] client layout snapshot hiba:", error.message);
    return EMPTY_CLIENT_COUNTS;
  }

  const snapshot = data as ClientLayoutSnapshotRpc;

  return {
    unreadMessages: Number(snapshot.unread_messages ?? 0),
    newOffers: Number(snapshot.new_offers ?? 0),
  };
}
