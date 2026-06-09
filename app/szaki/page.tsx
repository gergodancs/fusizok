import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getMatchedJobsForCraftsman } from "@/lib/craftsman";
import { getCraftsmanProfileForEdit } from "@/lib/craftsman-profile";
import { markOpenJobsSeen } from "@/lib/notifications";
import { formatLocationLabel } from "@/lib/places";
import { pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Nyitott munkák – fusizok.hu",
  description: "Böngéssz a környéken feladott, neked releváns barkács melók között.",
};

export const dynamic = "force-dynamic";

export default async function SzakiPage() {
  const { user } = await requireCraftsman("/szaki");
  const { professions, coverageAreas } = await getCraftsmanProfileForEdit(user.id);

  if (professions.length === 0 || coverageAreas.length === 0) {
    redirect("/szaki/profil");
  }

  const { jobs } = await getMatchedJobsForCraftsman(user.id);
  await markOpenJobsSeen(user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer>
        <div className="mb-10">
          <p className={pageEyebrowClassName}>Fusizni akarok</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Neked releváns munkák
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Csak azokat a nyitott melókat látod, amelyek illeszkednek a
            profilodban megadott kategóriákhoz és területekhez, és amelyekre
            még nem pályáztál.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {professions.map((profession) => (
              <span
                key={profession}
                className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400"
              >
                {profession}
              </span>
            ))}
            {coverageAreas.map((area) => (
              <span
                key={`${area.county}|${area.place}`}
                className="rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-400"
              >
                {formatLocationLabel(area.county, area.place)}
              </span>
            ))}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/40 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-200">
              Nincs illeszkedő munka
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Jelenleg nincs olyan nyitott meló a kiválasztott területeiden,
              ami passzol a profilodhoz. Nézz vissza később!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
