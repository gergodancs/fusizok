import { Lock } from "lucide-react";

type JobImagesLockedProps = {
  imageCount?: number;
};

export function JobImagesLocked({ imageCount = 1 }: JobImagesLockedProps) {
  const label =
    imageCount > 1
      ? `${imageCount} kép – csak bejelentkezett fusizóknak látható`
      : "Kép – csak bejelentkezett fusizóknak látható";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-400">Képek</p>
      <div
        className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900"
        role="img"
        aria-label={label}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #3f3f46 0 2px, transparent 2px 12px)",
            filter: "blur(1px)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950/80 ring-2 ring-amber-500/30">
            <Lock className="h-7 w-7 text-amber-400" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="max-w-xs text-sm font-medium text-zinc-300">
            A hirdetéshez tartozó fotók védettek
          </p>
          <p className="max-w-sm text-xs text-zinc-500">
            Regisztrálj fusizóként, hogy megtekinthesd a képeket és pályázhass a
            munkára.
          </p>
        </div>
      </div>
    </div>
  );
}
