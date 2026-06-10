import { getCraftsmanActivity } from "@/lib/bids";
import {
  craftsmanHasServiceArea,
  getCraftsmanProfileForEdit,
} from "@/lib/craftsman-profile";
import { getUserProfile } from "@/lib/auth/session";
import { getCraftsmanPortfolioImages } from "@/lib/portfolio";

export type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
  required: boolean;
};

export type CraftsmanOnboardingStatus = {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  requiredComplete: boolean;
  progressPercent: number;
};

export function buildCraftsmanOnboardingSteps(input: {
  hasSubCategories: boolean;
  hasServiceArea: boolean;
  hasBio: boolean;
  hasAvatar: boolean;
  portfolioCount: number;
  hasBid: boolean;
}): OnboardingStep[] {
  const profileReady = input.hasSubCategories && input.hasServiceArea;

  return [
    {
      id: "skills-area",
      label: "Tevékenységek és terület",
      description: "Válaszd ki az al-tevékenységeidet és a szolgáltatási körzetedet.",
      href: "/szaki/profil#craftsman-settings",
      completed: profileReady,
      required: true,
    },
    {
      id: "bio",
      label: "Bemutatkozás",
      description: "Írj pár mondatot magadról – segít meggyőzni a megrendelőket.",
      href: "/szaki/profil#craftsman-settings",
      completed: input.hasBio,
      required: false,
    },
    {
      id: "avatar",
      label: "Profilkép",
      description: "Tölts fel egy arcodat mutató képet a bizalomért.",
      href: "/szaki/profil#avatar",
      completed: input.hasAvatar,
      required: false,
    },
    {
      id: "portfolio",
      label: "Referencia galéria",
      description: "Mutass meg korábbi munkákat a portfóliódban.",
      href: "/szaki/profil#craftsman-settings",
      completed: input.portfolioCount > 0,
      required: false,
    },
    {
      id: "first-bid",
      label: "Első pályázat",
      description: "Böngéssz a nyitott munkák között és küldj egy ajánlatot.",
      href: "/szaki",
      completed: input.hasBid,
      required: false,
    },
  ];
}

export function summarizeOnboarding(steps: OnboardingStep[]): CraftsmanOnboardingStatus {
  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;
  const requiredComplete = steps
    .filter((step) => step.required)
    .every((step) => step.completed);

  return {
    steps,
    completedCount,
    totalCount,
    requiredComplete,
    progressPercent: Math.round((completedCount / totalCount) * 100),
  };
}

export async function getCraftsmanOnboardingStatus(
  userId: string,
): Promise<CraftsmanOnboardingStatus> {
  const [profile, userProfile, portfolioImages, activity] = await Promise.all([
    getCraftsmanProfileForEdit(userId),
    getUserProfile(userId),
    getCraftsmanPortfolioImages(userId),
    getCraftsmanActivity(userId),
  ]);

  const hasBid =
    activity.pending.length + activity.accepted.length + activity.closed.length >
    0;

  const steps = buildCraftsmanOnboardingSteps({
    hasSubCategories: profile.subCategories.length > 0,
    hasServiceArea: craftsmanHasServiceArea(profile),
    hasBio: Boolean(profile.bio?.trim()),
    hasAvatar: Boolean(userProfile?.avatar_url),
    portfolioCount: portfolioImages.length,
    hasBid,
  });

  return summarizeOnboarding(steps);
}
