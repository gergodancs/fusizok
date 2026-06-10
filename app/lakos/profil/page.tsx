import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Profil",
  description: "Profilkép és beállítások.",
};

export default async function LakosProfilPage() {
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect("/login?redirect=/lakos/profil");
  }

  if (profile?.role === "craftsman") {
    redirect("/szaki/profil");
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Profil</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Beállítások
          </h1>
          <p className="mt-2 text-zinc-400">
            Személyes adatok, profilkép és fiókkezelés.
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
            <ProfileSettingsForm
              defaultFullName={profile?.full_name ?? ""}
              defaultPhone={profile?.phone ?? ""}
            />
          </div>

          <DeleteAccountSection />
        </div>
      </PageContainer>
    </div>
  );
}
