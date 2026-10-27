import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(cls, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-stone-300")}
        />
      ))}
    </span>
  );
}

export function RatingPill({ rating, count }: { rating: number; count: number }) {
  if (!count) {
    return <span className="text-xs font-medium text-stone-500">New kitchen</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="inline-flex items-center gap-1 rounded-md bg-green-700 px-1.5 py-0.5 text-xs font-bold text-white">
        {rating.toFixed(1)} <Star className="h-3 w-3 fill-white" />
      </span>
      <span className="text-xs text-stone-500">({count})</span>
    </span>
  );
}
