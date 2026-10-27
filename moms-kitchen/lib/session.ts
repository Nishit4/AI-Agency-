import { isValidObjectId } from "mongoose";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { roleHome } from "@/lib/roles";
import type { Role, SessionUser } from "@/types";

/**
 * The logged-in user, loaded fresh from the database (so blocked users and
 * role changes take effect immediately). Cached per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !isValidObjectId(id)) return null;

  await connectDB();
  const user = await User.findById(id).lean();
  if (!user || !user.isActive) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as Role,
    phone: user.phone ?? "",
    profileImage: user.profileImage ?? "",
  };
});

/** Use in pages and server actions: redirects if not logged in or wrong role. */
export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}
