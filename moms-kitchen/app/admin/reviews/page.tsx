import { Eye, EyeOff, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { RatingStars } from "@/components/ui/rating";
import { deleteReview, toggleReviewHidden } from "@/lib/actions/admin";
import { listReviews } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  await requireUser(["ADMIN"]);
  const reviews = await listReviews();

  return (
    <>
      <PageHeader title="Reviews" description="Hide or remove reviews that break the community rules." />
      {reviews.length === 0 ? (
        <EmptyState emoji="⭐" title="No reviews yet" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className={`card p-4 ${review.isHidden ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{review.customerName}</p>
                  <p className="text-xs text-stone-500">
                    on{" "}
                    <Link href={`/kitchens/${review.kitchenId}`} className="font-medium text-brand-700 hover:underline">
                      {review.kitchenName}
                    </Link>{" "}
                    · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {review.isHidden && <Badge className="bg-stone-200 text-stone-700">Hidden</Badge>}
                  <RatingStars value={review.rating} />
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-700">{review.comment || <em className="text-stone-400">No comment</em>}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton action={toggleReviewHidden.bind(null, review.id)} className="btn-secondary btn-sm">
                  {review.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {review.isHidden ? "Unhide" : "Hide"}
                </ActionButton>
                <ActionButton
                  action={deleteReview.bind(null, review.id)}
                  confirmMessage="Delete this review permanently?"
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
