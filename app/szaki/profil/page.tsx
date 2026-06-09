import type { Metadata } from "next";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CraftsmanProfileSettings } from "@/components/craftsman/craftsman-profile-settings";
import { CraftsmanReviewsSection } from "@/components/reviews/craftsman-reviews-section";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getUserProfile } from "@/lib/auth/session";
import { getCraftsmanProfileForEdit } from "@/lib/craftsman-profile";
import { getCraftsmanPortfolioImages } from "@/lib/portfolio";
import { getCraftsmanReviewSummary } from "@/lib/reviews";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Fusizó profil – fusizok.hu",
  description: "Profilkép, galéria, értékelések és szakmai beállítások.",
};

export default async function SzakiProfilPage() {
  const { user } = await requireCraftsman("/szaki/profil");
  const [profile, { professions, districts, bio }, portfolioImages, reviewSummary] =
    await Promise.all([
      getUserProfile(user.id),
      getCraftsmanProfileForEdit(user.id),
      getCraftsmanPortfolioImages(user.id),
      getCraftsmanReviewSummary(user.id),
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
          <div className={`${cardClassName} p-6 sm:p-8`}>
            <AvatarUpload
              userName={profile?.full_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <CraftsmanProfileSettings
              defaultCategories={professions}
              defaultDistricts={districts}
              defaultBio={bio}
              portfolioImages={portfolioImages}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <CraftsmanReviewsSection summary={reviewSummary} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
