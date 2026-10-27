import { DashboardShell, type DashboardLink } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/session";

const LINKS: DashboardLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/providers", label: "Providers", icon: "Store" },
  { href: "/admin/orders", label: "Orders", icon: "ClipboardList" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/listings", label: "Listings", icon: "UtensilsCrossed" },
  { href: "/admin/categories", label: "Categories", icon: "Tags" },
  { href: "/admin/reviews", label: "Reviews", icon: "MessageSquare" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["ADMIN"]);
  return (
    <DashboardShell title="Admin panel" subtitle={user.email} links={LINKS}>
      {children}
    </DashboardShell>
  );
}
