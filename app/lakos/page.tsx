import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientHowItWorks } from "@/components/client/client-how-it-works";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { CLIENT_FOCUSED_SITE_DESCRIPTION } from "@/lib/seo/site-metadata";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Munka feladása ingyen | Helyi fusizók ajánlatai",
  description: CLIENT_FOCUSED_SITE_DESCRIPTION,
  openGraph: {
    title: "Munka feladása ingyen | Fusizok.hu",
    description: CLIENT_FOCUSED_SITE_DESCRIPTION,
    url: `${getMetadataBaseUrl()}/lakos`,
    locale: "hu_HU",
    siteName: "Fusizok.hu",
    type: "website",
  },
  alternates: {
    canonical: `${getMetadataBaseUrl()}/lakos`,
  },
};

export default async function LakosPage() {
  const { user, profile } = await getAuthContext();

  if (profile?.role === "craftsman") {
    redirect("/szaki");
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8 text-center sm:text-left">
          <p className={pageEyebrowClassName}>Segítséget keresek</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Munkafeladás
          </h1>
          <p className="mt-2 text-zinc-400">
            Mondd el, miben kell segítség – összekötünk a környék fusizóival,
            akiknek van szerszámuk és idejük.
          </p>
        </div>

        <div className="mb-6">
          <ClientHowItWorks />
        </div>

        <div className={`${cardClassName} p-6 sm:p-8`}>
          <JobPostForm isLoggedIn={Boolean(user)} />
        </div>
      </PageContainer>
    </div>
  );
}
