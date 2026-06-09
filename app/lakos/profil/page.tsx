import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Profil – fusizok.hu",
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
            Állítsd be a profilképedet – a fusizók is látni fogják a chatben.
          </p>
        </div>

        <div className={`${cardClassName} p-6 sm:p-8`}>
          <AvatarUpload
            userName={profile?.full_name ?? null}
            avatarUrl={profile?.avatar_url ?? null}
          />

          {profile?.full_name && (
            <p className="mt-6 border-t border-zinc-700 pt-6 text-sm text-zinc-400">
              Név:{" "}
              <span className="font-medium text-zinc-200">
                {profile.full_name}
              </span>
            </p>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
