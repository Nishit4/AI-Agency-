"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Category, Food, Kitchen, Review, User } from "@/lib/models";
import { recalculateKitchenRating } from "@/lib/ratings";
import { requireUser } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { categorySchema, formToObject } from "@/lib/validations";
import { KITCHEN_STATUSES, type ActionState, type KitchenStatus } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

async function requireAdmin() {
  const admin = await requireUser(["ADMIN"]);
  await connectDB();
  return admin;
}

function revalidatePublic() {
  revalidatePath("/admin", "layout");
  revalidatePath("/kitchens");
  revalidatePath("/");
}

export async function setKitchenStatus(kitchenId: string, status: KitchenStatus): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(kitchenId) || !KITCHEN_STATUSES.includes(status)) return failure("Invalid request.");
  const kitchen = await Kitchen.findByIdAndUpdate(kitchenId, { status }, { new: true }).lean();
  if (!kitchen) return failure("Kitchen not found.");
  revalidatePublic();
  revalidatePath(`/kitchens/${kitchenId}`);
  const verb: Record<KitchenStatus, string> = {
    APPROVED: "approved",
    REJECTED: "rejected",
    SUSPENDED: "suspended",
    PENDING: "moved to pending",
  };
  return success(`${kitchen.kitchenName} ${verb[status]}.`);
}

export async function toggleUserActive(userId: string): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!isValidObjectId(userId)) return failure("User not found.");
  if (userId === admin.id) return failure("You cannot block your own account.");
  const user = await User.findById(userId);
  if (!user) return failure("User not found.");
  user.isActive = !user.isActive;
  await user.save();
  revalidatePath("/admin/users");
  return success(`${user.name} has been ${user.isActive ? "unblocked" : "blocked"}.`);
}

export async function saveCategory(categoryId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const data = { ...parsed.data, slug: slugify(parsed.data.name) };

  const duplicate = await Category.findOne({
    slug: data.slug,
    ...(categoryId && isValidObjectId(categoryId) ? { _id: { $ne: categoryId } } : {}),
  }).lean();
  if (duplicate) return { ok: false, message: "A category with this name already exists.", errors: { name: ["Already exists"] } };

  if (categoryId) {
    if (!isValidObjectId(categoryId)) return failure("Category not found.");
    await Category.updateOne({ _id: categoryId }, data);
  } else {
    await Category.create(data);
  }
  revalidatePublic();
  return success(categoryId ? "Category updated." : "Category created.");
}

export async function deleteCategory(categoryId: string): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(categoryId)) return failure("Category not found.");
  const inUse = await Food.countDocuments({ category: categoryId });
  if (inUse > 0) return failure(`This category is used by ${inUse} menu item(s) and cannot be deleted.`);
  await Category.deleteOne({ _id: categoryId });
  revalidatePublic();
  return success("Category deleted.");
}

export async function toggleReviewHidden(reviewId: string): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(reviewId)) return failure("Review not found.");
  const review = await Review.findById(reviewId);
  if (!review) return failure("Review not found.");
  review.isHidden = !review.isHidden;
  await review.save();
  await recalculateKitchenRating(review.kitchen);
  revalidatePublic();
  return success(review.isHidden ? "Review hidden from the public." : "Review is visible again.");
}

export async function deleteReview(reviewId: string): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(reviewId)) return failure("Review not found.");
  const review = await Review.findByIdAndDelete(reviewId).lean();
  if (!review) return failure("Review not found.");
  await recalculateKitchenRating(review.kitchen);
  revalidatePublic();
  return success("Review deleted.");
}

export async function adminToggleFood(foodId: string): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(foodId)) return failure("Item not found.");
  const food = await Food.findById(foodId);
  if (!food) return failure("Item not found.");
  food.isAvailable = !food.isAvailable;
  await food.save();
  revalidatePublic();
  return success(`${food.name} is now ${food.isAvailable ? "listed" : "hidden"}.`);
}

export async function adminDeleteFood(foodId: string): Promise<ActionState> {
  await requireAdmin();
  if (!isValidObjectId(foodId)) return failure("Item not found.");
  const result = await Food.deleteOne({ _id: foodId });
  if (result.deletedCount === 0) return failure("Item not found.");
  revalidatePublic();
  return success("Listing removed.");
}
