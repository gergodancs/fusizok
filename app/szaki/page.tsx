import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { PageContainer } from "@/components/layout/page-container";
import { PwaNotificationCta } from "@/components/push/pwa-notification-cta";
import { ShareSiteButton } from "@/components/share/share-site-button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getMatchedJobsForCraftsman } from "@/lib/craftsman";
import {
  craftsmanHasServiceArea,
  getCraftsmanProfileForEdit,
} from "@/lib/craftsman-profile";
import { markOpenJobsSeen } from "@/lib/notifications";
import { formatSubCategoryLabels } from "@/lib/constants/categories";
import { formatLocationLabel } from "@/lib/places";
import { pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Nyitott munkák – fusizok.hu",
  description: "Böngéssz a környéken feladott, neked releváns barkács melók között.",
};

export const dynamic = "force-dynamic";

export default async function SzakiPage() {
  const { user } = await requireCraftsman("/szaki");
  const profile = await getCraftsmanProfileForEdit(user.id);

  if (
    profile.subCategories.length === 0 ||
    !craftsmanHasServiceArea(profile)
  ) {
    redirect("/szaki/profil");
  }

  const { jobs } = await getMatchedJobsForCraftsman(user.id);
  await markOpenJobsSeen(user.id);

  const locationLabel =
    profile.location.county && profile.location.city
      ? `${formatLocationLabel(profile.location.county, profile.location.city)} · ${profile.location.serviceRadiusKm} km`
      : profile.coverageAreas
          .map((area) => formatLocationLabel(area.county, area.place))
          .join(", ");

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
            beállított al-tevékenységeidhez, a szolgáltatási bázisodhoz és
            hatósugaradhoz – és amelyekre még nem pályáztál.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {formatSubCategoryLabels(profile.subCategories)
              .slice(0, 8)
              .map((label) => (
                <span
                  key={label}
                  className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400"
                >
                  {label}
                </span>
              ))}
            {profile.subCategories.length > 8 && (
              <span className="rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
                +{profile.subCategories.length - 8} további
              </span>
            )}
            {locationLabel && (
              <span className="rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
                {locationLabel}
              </span>
            )}
          </div>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="Nincs illeszkedő munka"
            description="Jelenleg nincs olyan nyitott meló a beállított területeden, ami passzol a profilodhoz. Kapcsold be az értesítéseket, és oszd meg az oldalt – így hamarabb érkezhet meló a környékre!"
            actions={[
              { href: "/szaki/profil", label: "Profil bővítése" },
              { href: "/szaki/aktivitas", label: "Aktivitásom" },
            ]}
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-3">
              <PwaNotificationCta isLoggedIn variant="compact" />
              <ShareSiteButton message="Fusizok.hu – fusimunkák a környékeden. Nézd meg!" />
            </div>
          </EmptyState>
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
