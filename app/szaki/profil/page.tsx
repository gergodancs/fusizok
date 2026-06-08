import type { Metadata } from "next";
import { CraftsmanProfileForm } from "@/components/craftsman/craftsman-profile-form";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanProfileForEdit } from "@/lib/craftsman-profile";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Fusizó profil – fusizok.hu",
  description: "Állítsd be a szakmáidat és a kerületeket, ahol vállalsz munkát.",
};

export default async function SzakiProfilPage() {
  const { user } = await requireCraftsman("/szaki/profil");
  const { professions, districts } = await getCraftsmanProfileForEdit(user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Profil</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Beállítások
          </h1>
          <p className="mt-2 text-zinc-400">
            Itt bármikor módosíthatod, milyen munkákat és mely budapesti
            kerületekben vállalsz.
          </p>
        </div>

        <div className={`${cardClassName} p-6 sm:p-8`}>
          <CraftsmanProfileForm
            defaultCategories={professions}
            defaultDistricts={districts}
            showSuccessBanner
          />
        </div>
      </PageContainer>
    </div>
  );
}
