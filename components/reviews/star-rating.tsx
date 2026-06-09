type StarRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, max = 5, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div
      className={`flex items-center gap-0.5 ${starSize}`}
      aria-label={`${rating} / ${max} csillag`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <span
            key={i}
            className={filled ? "text-amber-400" : "text-zinc-600"}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
