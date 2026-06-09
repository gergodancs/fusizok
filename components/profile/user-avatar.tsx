import Image from "next/image";

type UserAvatarProps = {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (avatarUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-zinc-600 bg-zinc-800 ${sizeClass} ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={name ? `${name} profilképe` : "Profilkép"}
          fill
          className="object-cover"
          sizes="96px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-zinc-600 bg-gradient-to-br from-amber-500/30 to-zinc-800 font-bold text-amber-300 ${sizeClass} ${className}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
