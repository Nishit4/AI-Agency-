import type { Metadata } from "next";
import { Badge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { RatingStars } from "@/components/ui/rating";
import { getProviderReviews } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

export default async function ProviderReviewsPage() {
  const { kitchen } = await requireProviderKitchen();
  const reviews = await getProviderReviews(kitchen.id);
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars && !r.isHidden).length,
  }));
  const visible = reviews.filter((r) => !r.isHidden).length;

  return (
    <>
      <PageHeader title="Reviews" description="What customers say about your food." />
      {reviews.length === 0 ? (
        <EmptyState emoji="⭐" title="No reviews yet" description="Customers can review your kitchen after their order is delivered." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <section className="card h-fit p-5 text-center">
            <p className="font-display text-5xl font-bold">{kitchen.rating.toFixed(1)}</p>
            <div className="mt-1 flex justify-center"><RatingStars value={kitchen.rating} size="md" /></div>
            <p className="mt-1 text-sm text-stone-500">{kitchen.ratingCount} reviews</p>
            <ul className="mt-4 space-y-1.5 text-left text-sm">
              {breakdown.map((row) => (
                <li key={row.stars} className="flex items-center gap-2">
                  <span className="w-6 text-stone-600">{row.stars}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-orange-100">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${visible ? (row.count / visible) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 text-right text-stone-500">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{review.customerName}</p>
                  <div className="flex items-center gap-2">
                    {review.isHidden && <Badge className="bg-stone-200 text-stone-700">Hidden by admin</Badge>}
                    <RatingStars value={review.rating} />
                  </div>
                </div>
                <p className="text-xs text-stone-500">{formatDate(review.createdAt)}</p>
                {review.comment && <p className="mt-2 text-sm text-stone-700">{review.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
