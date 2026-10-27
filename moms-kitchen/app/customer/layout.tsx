import { DashboardShell, type DashboardLink } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/session";

const LINKS: DashboardLink[] = [
  { href: "/customer/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/customer/orders", label: "My orders", icon: "Package" },
  { href: "/customer/cart", label: "Cart", icon: "ShoppingCart" },
  { href: "/customer/addresses", label: "Addresses", icon: "MapPin" },
  { href: "/profile", label: "Profile", icon: "UserRound" },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["CUSTOMER"]);
  return (
    <DashboardShell title="My account" subtitle={user.email} links={LINKS}>
      {children}
    </DashboardShell>
  );
}
