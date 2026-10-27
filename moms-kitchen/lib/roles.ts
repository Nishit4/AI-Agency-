import type { Role } from "@/types";

/** Where each role lands after logging in. */
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/customer/dashboard",
  PROVIDER: "/provider/dashboard",
  ADMIN: "/admin/dashboard",
};

export function roleHome(role?: Role | null) {
  return role ? ROLE_HOME[role] : "/";
}

export const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Home Cook",
  ADMIN: "Admin",
};
