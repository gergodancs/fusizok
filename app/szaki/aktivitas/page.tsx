import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanActivity } from "@/lib/bids";
import type { BidWithJob } from "@/lib/bids";
import { markCraftsmanActivitySeen } from "@/lib/notifications";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import {
  getBidActivityStatusLabel,
  getJobStatusLabel,
} from "@/lib/status-labels";
import { formatJobLocation } from "@/lib/places";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Aktivitásom – fusizok.hu",
  description: "Kövesd nyomon a pályázataidat és a munkáid állapotát.",
};

function BidActivityCard({ bid }: { bid: BidWithJob }) {
  return (
    <article className={`${cardClassName} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-zinc-100">{bid.job.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {bid.job.category} · {formatJobLocation(bid.job)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            bid.contact_shared
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {getBidActivityStatusLabel(bid)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-400">
        <p>
          Ajánlott ár:{" "}
          <span className="font-semibold text-zinc-200">
            {bid.price !== null
              ? `${Number(bid.price).toLocaleString("hu-HU")} Ft`
              : "Nincs megadva"}
          </span>
        </p>
        {bid.availability_duration && (
          <p>
            Vállalási idő:{" "}
            <span className="text-zinc-200">{bid.availability_duration}</span>
          </p>
        )}
        {bid.message && <p className="italic">&bdquo;{bid.message}&ldquo;</p>}
        <p className="text-xs text-zinc-500">
          Munka státusza: {getJobStatusLabel(bid.job.status)} · Pályázat:{" "}
          {new Date(bid.created_at).toLocaleDateString("hu-HU")}
        </p>
      </div>

      {bid.contact_shared ? (
        <Link
          href={`/szaki/uzenetek?job=${bid.job_id}`}
          className="mt-4 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
        >
          Ugrás a chathez →
        </Link>
      ) : (
        <p className="mt-4 text-xs text-zinc-500">
          A chat akkor nyílik meg, ha a megrendelő megosztja veled a
          kapcsolatot.
        </p>
      )}
    </article>
  );
}

function ActivitySection({
  title,
  description,
  bids,
  emptyText,
  emptyAction,
}: {
  title: string;
  description: string;
  bids: BidWithJob[];
  emptyText: string;
  emptyAction?: { href: string; label: string };
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {bids.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500">
          <p>{emptyText}</p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="mt-3 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              {emptyAction.label} →
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {bids.map((bid) => (
            <BidActivityCard key={bid.id} bid={bid} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function SzakiAktivitasPage() {
  const { user } = await requireCraftsman("/szaki/aktivitas");
  await markCraftsmanActivitySeen(user.id);
  const activity = await getCraftsmanActivity(user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer>
        <div className="mb-10">
          <p className={pageEyebrowClassName}>Aktivitásom</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Pályázataim
          </h1>
          <p className="mt-2 text-zinc-400">
            Itt látod, mire pályáztál, mi van függőben, mit fogadtak el, és mi
            zárult le.
          </p>
        </div>

        <ActivitySection
          title="Függőben"
          description="Pályázataid, amelyekre még vársz választ."
          bids={activity.pending}
          emptyText="Nincs függőben lévő pályázatod."
          emptyAction={{ href: "/szaki", label: "Nyitott munkák böngészése" }}
        />

        <ActivitySection
          title="Aktív / kontakt megosztva"
          description="Pályázatok, ahol a megrendelő megosztotta veled a kapcsolatot."
          bids={activity.accepted}
          emptyText="Még nincs aktív pályázatod."
          emptyAction={{ href: "/szaki", label: "Pályázz új munkákra" }}
        />

        <RealtimeRefresh
          table="job_bids"
          filter={`craftsman_id=eq.${user.id}`}
        />

        <ActivitySection
          title="Lezárt / elutasított"
          description="Elutasított ajánlatok vagy lezárt pályázások."
          bids={activity.closed}
          emptyText="Nincs lezárt pályázatod."
        />
      </PageContainer>
    </div>
  );
}
