import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { VegMark } from "@/components/ui/badges";
import { FoodVisual } from "@/components/ui/food-visual";
import { DEFAULT_FOOD_EMOJI } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { FoodDTO } from "@/types";

export function FoodCard({
  food,
  showKitchen = true,
  canOrder = true,
}: {
  food: FoodDTO;
  showKitchen?: boolean;
  canOrder?: boolean;
}) {
  return (
    // Compact horizontal row on phones, vertical card from 480px up
    <article className="card group flex overflow-hidden min-[480px]:flex-col">
      <Link href={`/food/${food.id}`} className="relative block w-28 shrink-0 min-[480px]:w-full">
        <FoodVisual
          image={food.image}
          emoji={food.category?.emoji ?? DEFAULT_FOOD_EMOJI}
          alt={food.name}
          seed={food.id}
          className="h-full min-h-[7.5rem] w-full transition group-hover:brightness-105 min-[480px]:aspect-[4/3] min-[480px]:h-auto min-[480px]:min-h-0"
          emojiClassName="text-4xl min-[480px]:text-5xl"
        />
        {food.category && (
          <span className="absolute left-3 top-3 hidden rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm min-[480px]:inline-block">
            {food.category.name}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 min-[480px]:p-4">
        <div className="flex items-start gap-2">
          <VegMark isVeg={food.isVeg} className="mt-1" />
          <Link href={`/food/${food.id}`} className="font-semibold leading-snug hover:text-brand-700">
            {food.name}
          </Link>
        </div>
        {showKitchen && food.kitchenName && (
          <Link href={`/kitchens/${food.kitchenId}`} className="mt-1 text-xs font-medium text-brand-700 hover:underline">
            by {food.kitchenName}
          </Link>
        )}
        <p className="mt-1.5 line-clamp-2 text-sm text-stone-600">{food.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 min-[480px]:pt-4">
          <span className="text-lg font-bold">{formatPrice(food.price)}</span>
          {canOrder && (
            <AddToCartButton
              itemType="FOOD"
              itemId={food.id}
              size="sm"
              disabled={!food.isAvailable}
              disabledLabel="Sold out"
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function FoodGrid({ foods, showKitchen, canOrder }: { foods: FoodDTO[]; showKitchen?: boolean; canOrder?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} showKitchen={showKitchen} canOrder={canOrder} />
      ))}
    </div>
  );
}
