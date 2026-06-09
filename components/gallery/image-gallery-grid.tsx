import Image from "next/image";

type ImageGalleryGridProps = {
  imageUrls: string[];
  title?: string;
  emptyMessage?: string;
};

export function ImageGalleryGrid({
  imageUrls,
  title = "Galéria",
  emptyMessage,
}: ImageGalleryGridProps) {
  if (!imageUrls.length) {
    if (!emptyMessage) return null;
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-sm font-medium text-zinc-400">{title}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {imageUrls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
          >
            <Image
              src={url}
              alt={`${title} – kép ${index + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 200px"
              unoptimized
            />
          </a>
        ))}
      </div>
    </div>
  );
}
