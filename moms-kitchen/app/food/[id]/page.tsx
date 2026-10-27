import { Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FoodCard } from "@/components/food/food-card";
import { Badge, OpenBadge, VegMark } from "@/components/ui/badges";
import { FoodVisual } from "@/components/ui/food-visual";
import { RatingPill } from "@/components/ui/rating";
import { DEFAULT_FOOD_EMOJI } from "@/lib/constants";
import { getFoodPage } from "@/lib/data/public";
import { getCurrentUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getFoodPage(id);
  return { title: data?.food.name ?? "Food" };
}

export default async function FoodPage({ params }: Props) {
  const { id } = await params;
  const [data, user] = await Promise.all([getFoodPage(id), getCurrentUser()]);
  if (!data) notFound();
  const { food, kitchen, more } = data;
  const canOrder = !user || user.role === "CUSTOMER";

  return (
    <div className="container-page py-8">
      <nav className="mb-5 text-sm text-stone-500" aria-label="Breadcrumb">
        <Link href="/kitchens" className="hover:text-brand-700">Kitchens</Link> /{" "}
        <Link href={`/kitchens/${kitchen.id}`} className="hover:text-brand-700">{kitchen.kitchenName}</Link> /{" "}
        <span className="text-ink">{food.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <FoodVisual
          image={food.image}
          emoji={food.category?.emoji ?? DEFAULT_FOOD_EMOJI}
          alt={food.name}
          seed={food.id}
          className="aspect-[4/3] w-full rounded-3xl shadow-card"
          emojiClassName="text-8xl sm:text-9xl"
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {food.category && (
              <Badge className="bg-brand-100 text-brand-800">
                {food.category.emoji} {food.category.name}
              </Badge>
            )}
            <Badge className={food.isVeg ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              <VegMark isVeg={food.isVeg} className="h-3.5 w-3.5" /> {food.isVeg ? "Veg" : "Non-veg"}
            </Badge>
            {!food.isAvailable && <Badge className="bg-stone-200 text-stone-700">Currently unavailable</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{food.name}</h1>
          <p className="mt-3 text-3xl font-bold text-brand-700">{formatPrice(food.price)}</p>
          <p className="mt-4 text-stone-700">{food.description || "Freshly prepared at home."}</p>

          <div className="mt-6">
            {canOrder ? (
              <AddToCartButton
                itemType="FOOD"
                itemId={food.id}
                withQuantity
                disabled={!food.isAvailable || !kitchen.isOpen}
                disabledLabel={!food.isAvailable ? "Currently unavailable" : "Kitchen is closed"}
                className="max-w-sm"
              />
            ) : (
              <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
                Log in with a customer account to order food.
              </p>
            )}
          </div>

          {/* Kitchen info */}
          <Link href={`/kitchens/${kitchen.id}`} className="card mt-8 flex items-start gap-4 p-4 transition hover:border-orange-200">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-2xl" aria-hidden>
              👩‍🍳
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{kitchen.kitchenName}</p>
                <OpenBadge isOpen={kitchen.isOpen} />
              </div>
              <div className="mt-1"><RatingPill rating={kitchen.rating} count={kitchen.ratingCount} /></div>
              <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
                <MapPin className="h-3.5 w-3.5" /> {kitchen.address.area}, {kitchen.address.city}
              </p>
              {kitchen.openingHours && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-600">
                  <Clock className="h-3.5 w-3.5" /> {kitchen.openingHours}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title">More from {kitchen.kitchenName}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {more.map((item) => (
              <FoodCard key={item.id} food={item} showKitchen={false} canOrder={canOrder && kitchen.isOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
