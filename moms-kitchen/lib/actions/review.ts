"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Order, Review } from "@/lib/models";
import { canReviewOrder } from "@/lib/order-rules";
import { recalculateKitchenRating } from "@/lib/ratings";
import { requireUser } from "@/lib/session";
import { formToObject, reviewSchema } from "@/lib/validations";
import type { ActionState, OrderStatus } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

export async function createReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["CUSTOMER"]);
  const parsed = reviewSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const { orderId, rating, comment } = parsed.data;
  if (!isValidObjectId(orderId)) return failure("Order not found.");

  await connectDB();
  const order = await Order.findOne({ _id: orderId, customer: user.id }).lean();
  if (!order) return failure("Order not found.");

  const alreadyReviewed = Boolean(await Review.exists({ order: order._id }));
  if (!canReviewOrder(order.orderStatus as OrderStatus, alreadyReviewed)) {
    return failure(alreadyReviewed ? "You have already reviewed this order." : "You can review an order after it is delivered.");
  }

  const firstFood = order.items.find((item) => item.itemType === "FOOD");
  await Review.create({
    customer: user.id,
    kitchen: order.kitchen,
    food: firstFood?.itemId ?? null,
    order: order._id,
    rating,
    comment,
  });
  await recalculateKitchenRating(order.kitchen);

  revalidatePath(`/customer/orders/${orderId}`);
  revalidatePath(`/kitchens/${String(order.kitchen)}`);
  return success("Thank you! Your review has been posted.");
}
