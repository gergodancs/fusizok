import type { JobBidStats } from "@/lib/job-bid-stats";

type JobMarketStatsProps = {
  stats: JobBidStats;
  className?: string;
};

export function JobMarketStats({ stats, className = "" }: JobMarketStatsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="inline-flex items-center rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
        {stats.bidCount} pályázó
      </span>
      <span className="inline-flex items-center rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
        {stats.contactSharedCount} kapcsolatfelvétel
      </span>
    </div>
  );
}
