import Image from "next/image";

type JobImageGalleryProps = {
  imageUrls: string[];
  title: string;
};

export function JobImageGallery({ imageUrls, title }: JobImageGalleryProps) {
  if (!imageUrls.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-400">Képek</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {imageUrls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
          >
            <Image
              src={url}
              alt={`${title} – kép ${index + 1}`}
              fill
              className="object-cover transition hover:scale-105"
              sizes="(max-width: 640px) 50vw, 200px"
              unoptimized
            />
          </a>
        ))}
      </div>
    </div>
  );
}
