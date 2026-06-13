import Image from "next/image";
import { Images } from "lucide-react";

type JobCardImagePreviewProps = {
  imageUrls: string[];
  title: string;
};

const PREVIEW_LIMIT = 3;

export function JobCardImagePreview({
  imageUrls,
  title,
}: JobCardImagePreviewProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  const previewUrls = imageUrls.slice(0, PREVIEW_LIMIT);
  const extraCount = imageUrls.length - previewUrls.length;

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
        <Images className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {imageUrls.length} feltöltött kép
      </p>
      <div className="flex flex-wrap gap-2">
        {previewUrls.map((url, index) => (
          <div
            key={url}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-600/80 bg-zinc-900"
          >
            <Image
              src={url}
              alt={`${title} – kép ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-zinc-600/80 bg-zinc-900 text-xs font-bold text-zinc-400"
            aria-label={`További ${extraCount} kép`}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
}
