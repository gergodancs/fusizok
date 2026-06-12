import type { Metadata } from "next";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { CraftsmanOnboardingChecklist } from "@/components/craftsman/craftsman-onboarding-checklist";
import { CraftsmanProfileSettings } from "@/components/craftsman/craftsman-profile-settings";
import { getCraftsmanOnboardingStatus } from "@/lib/craftsman/onboarding";
import { KycVerificationSection } from "@/components/craftsman/kyc-verification-section";
import { CraftsmanReviewsSection } from "@/components/reviews/craftsman-reviews-section";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getUserProfile } from "@/lib/auth/session";
import { getCraftsmanProfileForEdit } from "@/lib/craftsman-profile";
import { getCraftsmanPortfolioImages } from "@/lib/portfolio";
import { getCraftsmanKycInfo } from "@/lib/kyc";
import { getCraftsmanReviewSummary } from "@/lib/reviews";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Fusizó profil – fusizok.hu",
  description: "Profilkép, galéria, értékelések és szakmai beállítások.",
};

export default async function SzakiProfilPage() {
  const { user } = await requireCraftsman("/szaki/profil");
  const [
    profile,
    { professions, subCategories, coverageAreas, location, bio },
    portfolioImages,
    reviewSummary,
    kycInfo,
    onboarding,
  ] = await Promise.all([
    getUserProfile(user.id),
    getCraftsmanProfileForEdit(user.id),
    getCraftsmanPortfolioImages(user.id),
    getCraftsmanReviewSummary(user.id),
    getCraftsmanKycInfo(user.id),
    getCraftsmanOnboardingStatus(user.id),
  ]);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Profil</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Beállítások
          </h1>
          <p className="mt-2 text-zinc-400">
            Profilkép, referencia galéria, értékelések és szakmai beállítások.
          </p>
        </div>

        <div className="space-y-6">
          <CraftsmanOnboardingChecklist status={onboarding} />

          <div id="avatar" className={`${cardClassName} p-6 sm:p-8`}>
            <AvatarUpload
              userName={profile?.full_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <ProfileSettingsForm
              defaultFullName={profile?.full_name ?? ""}
              defaultPhone={profile?.phone ?? ""}
            />
          </div>

          <div id="craftsman-settings" className={`${cardClassName} p-6 sm:p-8`}>
            <CraftsmanProfileSettings
              defaultCategories={professions}
              defaultSubCategories={subCategories}
              defaultCoverageAreas={coverageAreas}
              defaultLocation={location}
              defaultBio={bio}
              portfolioImages={portfolioImages}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <KycVerificationSection
              isVerified={kycInfo.isVerified}
              kycStatus={kycInfo.kycStatus}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <CraftsmanReviewsSection summary={reviewSummary} />
          </div>

          <DeleteAccountSection />
        </div>
      </PageContainer>
    </div>
  );
}
