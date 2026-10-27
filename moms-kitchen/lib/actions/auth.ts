"use server";

import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { roleHome } from "@/lib/roles";
import { formToObject, loginSchema, registerSchema } from "@/lib/validations";
import type { ActionState, Role } from "@/types";
import { failure, fieldErrors, keepValues, safeCallbackUrl } from "./helpers";

async function signInWithPassword(email: string, password: string): Promise<ActionState | null> {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error instanceof CredentialsSignin && error.code === "blocked") {
        return failure("Your account has been blocked. Please contact support.");
      }
      return failure("Invalid email or password.");
    }
    throw error;
  }
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);

  const result = await signInWithPassword(parsed.data.email, parsed.data.password);
  if (result) return keepValues(result, formData);

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("role").lean();
  const fallback = roleHome(user?.role as Role | undefined);
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));
  redirect(callbackUrl ?? fallback);
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const data = parsed.data;

  await connectDB();
  const email = data.email.toLowerCase();
  if (await User.exists({ email })) {
    return keepValues(
      { ok: false, message: "An account with this email already exists.", errors: { email: ["Email already registered"] } },
      formData,
    );
  }

  // Admin accounts cannot be created from the public form
  await User.create({
    name: data.name,
    email,
    phone: data.phone,
    passwordHash: await bcrypt.hash(data.password, 10),
    role: data.role,
  });

  const result = await signInWithPassword(email, data.password);
  if (result) return result;

  // New home cooks go straight to creating their kitchen profile
  redirect(data.role === "PROVIDER" ? "/provider/kitchen?welcome=1" : "/kitchens?welcome=1");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
