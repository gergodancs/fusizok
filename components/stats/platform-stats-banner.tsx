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
      className={`rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-zinc-900/80 px-5 py-4 text-center shadow-lg shadow-amber-500/5 sm:px-6 ${className}`}
    >
      <p className="text-sm font-semibold text-amber-300 sm:text-base">
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
