import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientJobsManager } from "@/components/jobs/client-jobs-manager";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { getClientJobs } from "@/lib/client-jobs";
import { btnPrimaryClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Saját hirdetéseim",
  description: "Aktív munkahirdetéseid szerkesztése és törlése.",
};

export default async function LakosHirdeteseimPage() {
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect("/login?redirect=/lakos/hirdeteseim");
  }

  if (profile?.role === "craftsman") {
    redirect("/szaki");
  }

  const jobs = await getClientJobs(user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={pageEyebrowClassName}>Megrendelő</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
              Saját hirdetéseim
            </h1>
            <p className="mt-2 text-zinc-400">
              Itt kezelheted az aktív munkahirdetéseidet – szerkesztheted a
              leírást, címet vagy helyszínt, illetve törölheted a hirdetést.
            </p>
          </div>
          <Link href="/lakos" className={btnPrimaryClassName}>
            Új hirdetés
          </Link>
        </div>

        <ClientJobsManager jobs={jobs} />
      </PageContainer>
    </div>
  );
}
