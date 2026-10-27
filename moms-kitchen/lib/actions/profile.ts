"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { formToObject, passwordSchema, profileSchema } from "@/lib/validations";
import type { ActionState } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);

  await connectDB();
  await User.updateOne({ _id: user.id }, parsed.data);
  revalidatePath("/", "layout");
  return success("Profile updated.");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);

  await connectDB();
  const doc = await User.findById(user.id).select("+passwordHash");
  if (!doc) return failure("Account not found.");
  const valid = await bcrypt.compare(parsed.data.currentPassword, doc.passwordHash);
  if (!valid) {
    return { ok: false, message: "Current password is incorrect.", errors: { currentPassword: ["Incorrect password"] } };
  }
  doc.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await doc.save();
  return success("Password changed successfully.");
}
