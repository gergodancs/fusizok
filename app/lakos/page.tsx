import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Munka feladása – fusizok.hu",
  description:
    "Írd le, mire van szükséged – a környék fusizói hamarosan jelentkeznek.",
};

export default async function LakosPage() {
  const { profile } = await getAuthContext();

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

        <div className={`${cardClassName} p-6 sm:p-8`}>
          <JobPostForm />
        </div>
      </PageContainer>
    </div>
  );
}
