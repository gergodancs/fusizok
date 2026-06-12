import Image from "next/image";

const HERO_IMAGE_PATH = "/images/hero-bg.jpg";

export function HomeHeroBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Image
        src={HERO_IMAGE_PATH}
        alt=""
        fill
        priority
        fetchPriority="high"
        quality={70}
        sizes="100vw"
        className="scale-105 object-cover object-center grayscale sm:blur-[2px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/72 to-zinc-950 sm:from-black/75 sm:via-black/70 sm:backdrop-blur-sm" />
    </div>
  );
}
