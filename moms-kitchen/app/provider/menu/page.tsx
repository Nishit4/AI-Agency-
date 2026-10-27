import { Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { Badge, VegMark } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { FoodVisual } from "@/components/ui/food-visual";
import { PageHeader } from "@/components/ui/page-header";
import { deleteFood, toggleFoodAvailability } from "@/lib/actions/provider";
import { DEFAULT_FOOD_EMOJI } from "@/lib/constants";
import { getProviderFoods } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Menu" };

export default async function ProviderMenuPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { kitchen } = await requireProviderKitchen();
  const [foods, { saved }] = await Promise.all([getProviderFoods(kitchen.id), searchParams]);

  return (
    <>
      <PageHeader
        title="Menu"
        description="Add dishes, update prices and mark items as available or sold out."
        actions={<Link href="/provider/menu/new" className="btn-primary">+ Add dish</Link>}
      />
      {saved && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">Dish saved successfully.</div>
      )}
      {foods.length === 0 ? (
        <EmptyState emoji="🍲" title="No dishes yet" description="Add your first dish so customers can order from you." actionHref="/provider/menu/new" actionLabel="Add your first dish" />
      ) : (
        <ul className="space-y-3">
          {foods.map((food) => (
            <li key={food.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <FoodVisual
                  image={food.image}
                  emoji={food.category?.emoji ?? DEFAULT_FOOD_EMOJI}
                  alt={food.name}
                  seed={food.id}
                  className="h-16 w-16 shrink-0 rounded-xl"
                  emojiClassName="text-3xl"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <VegMark isVeg={food.isVeg} />
                    <p className="font-semibold">{food.name}</p>
                  </div>
                  <p className="text-sm text-stone-500">
                    {food.category?.name} · <span className="font-semibold text-ink">{formatPrice(food.price)}</span>
                  </p>
                  <Badge className={food.isAvailable ? "mt-1 bg-green-100 text-green-800" : "mt-1 bg-stone-200 text-stone-700"}>
                    {food.isAvailable ? "Available" : "Sold out"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton action={toggleFoodAvailability.bind(null, food.id)} className="btn-secondary btn-sm">
                  {food.isAvailable ? "Mark sold out" : "Mark available"}
                </ActionButton>
                <Link href={`/provider/menu/${food.id}/edit`} className="btn-secondary btn-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <ActionButton
                  action={deleteFood.bind(null, food.id)}
                  confirmMessage={`Delete "${food.name}"? This cannot be undone.`}
                  className="btn-ghost btn-sm text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
