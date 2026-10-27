/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-orange-200 via-amber-100 to-yellow-50",
  "from-rose-200 via-orange-100 to-amber-50",
  "from-amber-200 via-yellow-100 to-lime-50",
  "from-lime-200 via-green-100 to-emerald-50",
  "from-orange-300 via-orange-100 to-rose-50",
];

function pick(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

/**
 * Shows the uploaded photo if there is one, otherwise a warm gradient with the
 * category emoji — so listings always look good even without photos.
 */
export function FoodVisual({
  image,
  emoji,
  alt,
  seed,
  className,
  emojiClassName = "text-5xl",
}: {
  image?: string;
  emoji: string;
  alt: string;
  seed: string;
  className?: string;
  emojiClassName?: string;
}) {
  if (image) {
    return (
      <div className={cn("overflow-hidden bg-orange-50", className)}>
        <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("flex items-center justify-center bg-gradient-to-br", pick(seed), className)}
    >
      <span className={cn("drop-shadow-sm", emojiClassName)} aria-hidden>
        {emoji}
      </span>
    </div>
  );
}
