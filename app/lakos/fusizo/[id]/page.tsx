import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CraftsmanPublicProfileView } from "@/components/craftsman/craftsman-public-profile-view";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import {
  clientHasBidFromCraftsman,
  getClientBidPreview,
  getCraftsmanPublicProfile,
} from "@/lib/craftsman-public-profile";
import { pageEyebrowClassName } from "@/lib/ui-classes";

type LakosFusizoProfilPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bid?: string }>;
};

export async function generateMetadata({
  params,
}: LakosFusizoProfilPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCraftsmanPublicProfile(id);
  return {
    title: profile?.full_name
      ? `${profile.full_name} – fusizó profil`
      : "Fusizó profil – fusizok.hu",
  };
}

export default async function LakosFusizoProfilPage({
  params,
  searchParams,
}: LakosFusizoProfilPageProps) {
  const { id: craftsmanId } = await params;
  const { bid: bidId } = await searchParams;
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect(`/login?redirect=/lakos/fusizo/${craftsmanId}`);
  }

  if (profile?.role === "craftsman") {
    redirect("/szaki/profil");
  }

  const hasAccess = await clientHasBidFromCraftsman(user.id, craftsmanId);
  if (!hasAccess) {
    notFound();
  }

  const craftsmanProfile = await getCraftsmanPublicProfile(craftsmanId);
  if (!craftsmanProfile) {
    notFound();
  }

  const bidPreview =
    bidId && typeof bidId === "string"
      ? await getClientBidPreview(user.id, bidId, craftsmanId)
      : null;

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-6">
          <p className={pageEyebrowClassName}>Fusizó profil</p>
        </div>

        <CraftsmanPublicProfileView
          profile={craftsmanProfile}
          bidPreview={bidPreview}
        />
      </PageContainer>
    </div>
  );
}
