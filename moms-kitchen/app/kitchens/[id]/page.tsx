import { CalendarDays, Clock, MapPin, Phone, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FoodCard } from "@/components/food/food-card";
import { Badge, KitchenStatusBadge, OpenBadge } from "@/components/ui/badges";
import { FoodVisual } from "@/components/ui/food-visual";
import { RatingPill, RatingStars } from "@/components/ui/rating";
import { TIFFIN_FREQUENCY_LABEL } from "@/lib/constants";
import { getKitchenPage } from "@/lib/data/public";
import { getCurrentUser } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import type { FoodDTO } from "@/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getKitchenPage(id);
  return { title: data?.kitchen.kitchenName ?? "Kitchen" };
}

export default async function KitchenPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const data = await getKitchenPage(id, user);
  if (!data) notFound();

  const { kitchen, foods, tiffins, reviews, isPreview } = data;
  const canOrder = (!user || user.role === "CUSTOMER") && !isPreview;
  const orderingBlocked = !kitchen.isOpen;

  // Group dishes by category for the menu
  const groups = new Map<string, { name: string; emoji: string; foods: FoodDTO[] }>();
  for (const food of foods) {
    const key = food.category?.id ?? "other";
    if (!groups.has(key)) {
      groups.set(key, { name: food.category?.name ?? "Other", emoji: food.category?.emoji ?? "🍲", foods: [] });
    }
    groups.get(key)!.foods.push(food);
  }

  return (
    <div className="pb-8">
      {isPreview && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="container-page flex flex-wrap items-center gap-2 py-3 text-sm text-amber-900">
            <KitchenStatusBadge status={kitchen.status} />
            Preview — this kitchen is not visible to customers until it is approved.
          </div>
        </div>
      )}

      {/* Kitchen header */}
      <section className="bg-gradient-to-b from-orange-100/70 to-cream">
        <div className="container-page grid grid-cols-1 gap-6 py-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-center lg:grid-cols-[340px_minmax(0,1fr)]">
          <FoodVisual
            image={kitchen.image}
            emoji={kitchen.categories?.[0]?.emoji ?? "🏠"}
            alt={kitchen.kitchenName}
            seed={kitchen.id}
            className="aspect-[16/10] w-full rounded-3xl shadow-card md:aspect-square"
            emojiClassName="text-7xl"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <OpenBadge isOpen={kitchen.isOpen} />
              {kitchen.isPureVeg && <Badge className="bg-green-100 text-green-800">🌱 Pure veg</Badge>}
              {kitchen.categories?.map((category) => (
                <Badge key={category.id} className="bg-white text-brand-800">
                  {category.emoji} {category.name}
                </Badge>
              ))}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{kitchen.kitchenName}</h1>
            <div className="mt-2">
              <RatingPill rating={kitchen.rating} count={kitchen.ratingCount} />
            </div>
            <p className="mt-3 max-w-2xl text-stone-600">{kitchen.description}</p>
            <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>
                  {kitchen.address.area}, {kitchen.address.city} – {kitchen.address.pincode}
                </span>
              </div>
              {kitchen.openingHours && (
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{kitchen.openingHours}</span>
                </div>
              )}
              {kitchen.serviceAreas.length > 0 && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>Delivers to: {kitchen.serviceAreas.join(", ")}</span>
                </div>
              )}
              {kitchen.phone && user && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{kitchen.phone}</span>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {orderingBlocked && (
        <div className="container-page mt-6">
          <div className="rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-700">
            This kitchen is closed right now and not accepting orders. You can still browse the menu.
          </div>
        </div>
      )}

      {/* Menu */}
      <section className="container-page mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">Menu</h2>
          {groups.size > 1 && (
            <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Menu sections">
              {Array.from(groups.entries()).map(([key, group]) => (
                <a key={key} href={`#menu-${key}`} className="shrink-0 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-medium hover:bg-brand-50">
                  {group.emoji} {group.name}
                </a>
              ))}
            </nav>
          )}
        </div>
        {foods.length === 0 && <p className="text-stone-600">This kitchen hasn&apos;t added any dishes yet.</p>}
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([key, group]) => (
            <div key={key} id={`menu-${key}`} className="scroll-mt-24">
              <h3 className="mb-3 text-lg font-bold">
                {group.emoji} {group.name} <span className="text-sm font-normal text-stone-500">({group.foods.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.foods.map((food) => (
                  <FoodCard key={food.id} food={food} showKitchen={false} canOrder={canOrder && !orderingBlocked} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiffin plans */}
      {tiffins.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="section-title">Tiffin plans</h2>
          <p className="mt-1 text-sm text-stone-600">Daily, weekly and monthly meal plans from this kitchen</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiffins.map((plan) => (
              <article key={plan.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="bg-brand-100 text-brand-800">
                      <CalendarDays className="h-3 w-3" /> {TIFFIN_FREQUENCY_LABEL[plan.frequency]}
                    </Badge>
                    <h3 className="mt-2 text-lg font-bold">{plan.name}</h3>
                  </div>
                  <span className="text-3xl" aria-hidden>🍱</span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{plan.description}</p>
                <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-stone-700">{plan.meals}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-xl font-bold">{formatPrice(plan.price)}</span>
                  {canOrder && (
                    <AddToCartButton
                      itemType="TIFFIN"
                      itemId={plan.id}
                      size="sm"
                      disabled={!plan.isAvailable || orderingBlocked}
                      disabledLabel={plan.isAvailable ? "Closed" : "Unavailable"}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="container-page mt-12">
        <h2 className="section-title">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-stone-600">No reviews yet. Order and be the first to review!</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                      {review.customerName?.[0] ?? "?"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{review.customerName ?? "Customer"}</p>
                      <p className="text-xs text-stone-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <RatingStars value={review.rating} />
                </div>
                {review.comment && <p className="mt-3 text-sm text-stone-700">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="container-page mt-10">
        <Link href="/kitchens" className="text-sm font-semibold text-brand-700 hover:underline">
          ← Back to all kitchens
        </Link>
      </div>
    </div>
  );
}
