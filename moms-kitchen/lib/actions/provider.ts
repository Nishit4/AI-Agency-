"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Category, Food, Kitchen, TiffinPlan } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { foodSchema, formToObject, kitchenSchema, tiffinSchema } from "@/lib/validations";
import type { ActionState } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

/** The logged-in provider's own kitchen. Providers can only touch their own data. */
async function ownKitchen() {
  const user = await requireUser(["PROVIDER"]);
  await connectDB();
  const kitchen = await Kitchen.findOne({ owner: user.id });
  return { user, kitchen };
}

function revalidateKitchen(kitchenId: string) {
  revalidatePath("/provider", "layout");
  revalidatePath(`/kitchens/${kitchenId}`);
  revalidatePath("/kitchens");
  revalidatePath("/");
}

export async function saveKitchen(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, kitchen } = await ownKitchen();
  const parsed = kitchenSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const { line, area, city, state, pincode, serviceAreas, ...rest } = parsed.data;

  const data = {
    ...rest,
    address: { line, area, city, state, pincode },
    // Always include the kitchen's own pincode in its service area
    serviceAreas: Array.from(new Set([pincode, ...serviceAreas])),
  };

  if (!kitchen) {
    const created = await Kitchen.create({ ...data, owner: user.id, status: "PENDING" });
    revalidateKitchen(String(created._id));
    return success("Kitchen created! It will be visible to customers once an admin approves it.");
  }

  kitchen.set(data);
  // A rejected kitchen goes back to the approval queue after it is edited
  if (kitchen.status === "REJECTED") kitchen.status = "PENDING";
  await kitchen.save();
  revalidateKitchen(String(kitchen._id));
  return success(
    kitchen.status === "PENDING" ? "Kitchen updated and sent for approval." : "Kitchen profile updated.",
  );
}

export async function toggleKitchenOpen(): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen) return failure("Create your kitchen first.");
  kitchen.isOpen = !kitchen.isOpen;
  await kitchen.save();
  revalidateKitchen(String(kitchen._id));
  return success(kitchen.isOpen ? "Kitchen is now accepting orders." : "Kitchen is now closed for orders.");
}

export async function saveFood(foodId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen) return failure("Create your kitchen profile first.");
  const parsed = foodSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const { categoryId, ...data } = parsed.data;

  if (!isValidObjectId(categoryId) || !(await Category.exists({ _id: categoryId }))) {
    return { ok: false, message: "Choose a valid category.", errors: { categoryId: ["Choose a category"] } };
  }

  if (foodId) {
    if (!isValidObjectId(foodId)) return failure("Item not found.");
    const result = await Food.updateOne(
      { _id: foodId, kitchen: kitchen._id },
      { ...data, category: categoryId },
    );
    if (result.matchedCount === 0) return failure("Item not found.");
  } else {
    await Food.create({ ...data, category: categoryId, kitchen: kitchen._id });
  }
  revalidateKitchen(String(kitchen._id));
  redirect("/provider/menu?saved=1");
}

export async function toggleFoodAvailability(foodId: string): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen || !isValidObjectId(foodId)) return failure("Item not found.");
  const food = await Food.findOne({ _id: foodId, kitchen: kitchen._id });
  if (!food) return failure("Item not found.");
  food.isAvailable = !food.isAvailable;
  await food.save();
  revalidateKitchen(String(kitchen._id));
  return success(`${food.name} is now ${food.isAvailable ? "available" : "unavailable"}.`);
}

export async function deleteFood(foodId: string): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen || !isValidObjectId(foodId)) return failure("Item not found.");
  const result = await Food.deleteOne({ _id: foodId, kitchen: kitchen._id });
  if (result.deletedCount === 0) return failure("Item not found.");
  revalidateKitchen(String(kitchen._id));
  return success("Menu item deleted.");
}

export async function saveTiffin(tiffinId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen) return failure("Create your kitchen profile first.");
  const parsed = tiffinSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);

  if (tiffinId) {
    if (!isValidObjectId(tiffinId)) return failure("Plan not found.");
    const result = await TiffinPlan.updateOne({ _id: tiffinId, kitchen: kitchen._id }, parsed.data);
    if (result.matchedCount === 0) return failure("Plan not found.");
  } else {
    await TiffinPlan.create({ ...parsed.data, kitchen: kitchen._id });
  }
  revalidateKitchen(String(kitchen._id));
  redirect("/provider/tiffin?saved=1");
}

export async function toggleTiffinAvailability(tiffinId: string): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen || !isValidObjectId(tiffinId)) return failure("Plan not found.");
  const plan = await TiffinPlan.findOne({ _id: tiffinId, kitchen: kitchen._id });
  if (!plan) return failure("Plan not found.");
  plan.isAvailable = !plan.isAvailable;
  await plan.save();
  revalidateKitchen(String(kitchen._id));
  return success(`${plan.name} is now ${plan.isAvailable ? "available" : "unavailable"}.`);
}

export async function deleteTiffin(tiffinId: string): Promise<ActionState> {
  const { kitchen } = await ownKitchen();
  if (!kitchen || !isValidObjectId(tiffinId)) return failure("Plan not found.");
  const result = await TiffinPlan.deleteOne({ _id: tiffinId, kitchen: kitchen._id });
  if (result.deletedCount === 0) return failure("Plan not found.");
  revalidateKitchen(String(kitchen._id));
  return success("Tiffin plan deleted.");
}
