"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Address } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { addressSchema, formToObject } from "@/lib/validations";
import type { ActionState } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

const MAX_ADDRESSES = 10;

export async function createAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["CUSTOMER"]);
  const parsed = addressSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);

  await connectDB();
  if ((await Address.countDocuments({ user: user.id })) >= MAX_ADDRESSES) {
    return failure(`You can save up to ${MAX_ADDRESSES} addresses.`);
  }
  await Address.create({ ...parsed.data, user: user.id });

  revalidatePath("/customer", "layout");
  revalidatePath("/checkout");
  return success("Address saved.");
}

export async function deleteAddress(addressId: string): Promise<ActionState> {
  const user = await requireUser(["CUSTOMER"]);
  if (!isValidObjectId(addressId)) return failure("Address not found.");
  await connectDB();
  // Users can only delete their own addresses
  const result = await Address.deleteOne({ _id: addressId, user: user.id });
  if (result.deletedCount === 0) return failure("Address not found.");

  revalidatePath("/customer", "layout");
  revalidatePath("/checkout");
  return success("Address removed.");
}
