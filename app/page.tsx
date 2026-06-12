import type { Metadata } from "next";
import {
  ClipboardList,
  Hammer,
  ListChecks,
  MapPin,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeHeroBackground } from "@/components/home/home-hero-background";
import { PublicJobPreviewList } from "@/components/jobs/public-job-preview-list";
import { PlatformStatsBanner } from "@/components/stats/platform-stats-banner";
import { PwaNotificationCta } from "@/components/push/pwa-notification-cta";
import { getAuthContext } from "@/lib/auth/session";
import { SHOW_PLATFORM_STATS_BANNER } from "@/lib/constants/beta";
import { listGuestHomepageJobPreviews } from "@/lib/jobs/guest-job-previews";
import {
  CLIENT_FOCUSED_OG_DESCRIPTION,
  CLIENT_FOCUSED_OG_TITLE,
  CLIENT_FOCUSED_SITE_DESCRIPTION,
  CLIENT_FOCUSED_SITE_TITLE,
} from "@/lib/seo/site-metadata";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import { getPlatformStats } from "@/lib/stats/platform-stats";

export const metadata: Metadata = {
  title: CLIENT_FOCUSED_SITE_TITLE,
  description: CLIENT_FOCUSED_SITE_DESCRIPTION,
  openGraph: {
    title: CLIENT_FOCUSED_OG_TITLE,
    description: CLIENT_FOCUSED_OG_DESCRIPTION,
    url: getMetadataBaseUrl(),
  },
  alternates: {
    canonical: getMetadataBaseUrl(),
  },
};

const FEATURES = [
  {
    icon: Hammer,
    title: "Kis melók, nagy segítség",
    text: "Polc fúrás, bútor összerakás, fűnyírás – pont az ilyen hétköznapi munkákra építünk.",
  },
  {
    icon: MapPin,
    title: "A környékeden",
    text: "Megye és település alapján találod meg a közelben fusizókat, akiknek van idejük és szerszámuk.",
  },
  {
    icon: ListChecks,
    title: "Egyszerűen",
    text: "Leírod, mire van szükséged, a fusizók pedig jelentkeznek. Nincs bonyolult folyamat.",
  },
] as const;

export default async function Home() {
  const [{ user, profile }, recentJobs, stats] = await Promise.all([
    getAuthContext(),
    listGuestHomepageJobPreviews(10),
    SHOW_PLATFORM_STATS_BANNER ? getPlatformStats() : Promise.resolve(null),
  ]);

  if (user && profile?.role === "craftsman") {
    redirect("/szaki");
  }

  if (user && profile?.role === "client") {
    redirect("/lakos/ajanlatok");
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <HomeHeroBackground />
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-orange-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-600/60 bg-black/40 px-4 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur-sm">
              <Wrench
                className="h-4 w-4 text-amber-500"
                strokeWidth={1.75}
                aria-hidden
              />
              Ingyenes munkafeladás megrendelőknek
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-50 drop-shadow-lg sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[1.15]">
              Írd ki a munkát,{" "}
              <span className="text-amber-400">ajánlatok jönnek</span> a környék
              fusizóitól
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-300 drop-shadow-md sm:text-lg sm:leading-relaxed">
              Polc fúrás, bútor összeszerelés, kert, villany – írd le ingyen,
              miben kell segítség. A helyi fusizók pályáznak rád árral és
              határidővel, te választasz. Fusizó vagy? Regisztrálj és böngéssz
              munkákat.
            </p>

            <PwaNotificationCta />

            {stats ? (
              <PlatformStatsBanner
                stats={stats}
                className="mx-auto mt-8 max-w-xl"
              />
            ) : null}

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/lakos"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-zinc-900 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400 sm:w-auto"
              >
                <ClipboardList className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Segítséget keresek (Munka feladása)
              </Link>
              <Link
                href="/szaki"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-zinc-600 bg-zinc-800 px-8 py-4 text-base font-bold text-zinc-100 shadow-sm transition hover:border-amber-500/50 hover:bg-zinc-700 sm:w-auto"
              >
                <Hammer className="h-5 w-5 text-amber-500/90" strokeWidth={1.75} aria-hidden />
                Fusizni akarok (Munkák böngészése)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicJobPreviewList
        jobs={recentJobs}
        title="Friss feladások"
        subtitle="Így néznek ki a feladások a platformon – példa és valódi hirdetések együtt. Fusizóként csak a valós munkákra pályázhatsz."
        ctaHref="/lakos"
        ctaLabel="Te is feladod a munkát"
      />

      <section className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-700/80 bg-zinc-800/60 p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/60">
                  <Icon
                    className="h-5 w-5 text-amber-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
