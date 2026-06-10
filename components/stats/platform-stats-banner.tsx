import { TrendingUp, Users } from "lucide-react";
import {
  formatPlatformCount,
  type PlatformStats,
} from "@/lib/stats/platform-stats";

type PlatformStatsBannerProps = {
  stats: PlatformStats;
  className?: string;
};

export function PlatformStatsBanner({
  stats,
  className = "",
}: PlatformStatsBannerProps) {
  const craftsmanLabel = formatPlatformCount(stats.craftsmanCount);
  const clientLabel = formatPlatformCount(stats.clientCount);

  return (
    <div
      className={`rounded-2xl border border-zinc-700/80 bg-zinc-800/40 px-5 py-4 text-center sm:px-6 ${className}`}
    >
      <div className="mx-auto mb-2 flex items-center justify-center gap-2 text-zinc-500">
        <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <TrendingUp className="h-3.5 w-3.5 text-amber-500/70" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-semibold text-zinc-200 sm:text-base">
        Csatlakozz a{" "}
        <span className="text-amber-400">{craftsmanLabel} szakihoz</span> és{" "}
        <span className="text-amber-400">{clientLabel} megrendelőhöz</span>{" "}
        országszerte!
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Élő közösség – napról napra növekszünk.
      </p>
    </div>
  );
}
