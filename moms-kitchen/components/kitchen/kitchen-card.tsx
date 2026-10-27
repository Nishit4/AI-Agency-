import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge, OpenBadge } from "@/components/ui/badges";
import { FoodVisual } from "@/components/ui/food-visual";
import { RatingPill } from "@/components/ui/rating";
import type { KitchenDTO } from "@/types";

export function KitchenCard({ kitchen }: { kitchen: KitchenDTO }) {
  const emoji = kitchen.categories?.[0]?.emoji ?? "🏠";
  return (
    <Link href={`/kitchens/${kitchen.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <FoodVisual
          image={kitchen.image}
          emoji={emoji}
          alt={kitchen.kitchenName}
          seed={kitchen.id}
          className="aspect-[16/9] w-full"
          emojiClassName="text-6xl"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <OpenBadge isOpen={kitchen.isOpen} />
          {kitchen.isPureVeg && <Badge className="bg-white/95 text-green-800">🌱 Pure veg</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug group-hover:text-brand-700">{kitchen.kitchenName}</h3>
          <RatingPill rating={kitchen.rating} count={kitchen.ratingCount} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">
            {kitchen.address.area}, {kitchen.address.city}
          </span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-stone-600">{kitchen.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {kitchen.categories?.slice(0, 3).map((category) => (
            <Badge key={category.id} className="bg-brand-50 text-brand-800">
              {category.emoji} {category.name}
            </Badge>
          ))}
          {kitchen.openingHours && (
            <span className="ml-auto flex items-center gap-1 text-xs text-stone-500">
              <Clock className="h-3.5 w-3.5" /> {kitchen.openingHours}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function KitchenGrid({ kitchens }: { kitchens: KitchenDTO[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {kitchens.map((kitchen) => (
        <KitchenCard key={kitchen.id} kitchen={kitchen} />
      ))}
    </div>
  );
}
