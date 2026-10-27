import type { Types } from "mongoose";
import { Kitchen, Review } from "@/lib/models";

/** Recalculate and store a kitchen's average rating from its visible reviews. */
export async function recalculateKitchenRating(kitchenId: Types.ObjectId | string) {
  const reviews = await Review.find({ kitchen: kitchenId, isHidden: false })
    .select("rating")
    .lean();
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  await Kitchen.updateOne(
    { _id: kitchenId },
    { rating: Math.round(average * 10) / 10, ratingCount: count },
  );
}
