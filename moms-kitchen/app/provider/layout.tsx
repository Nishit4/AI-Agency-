import { DashboardShell, type DashboardLink } from "@/components/layout/dashboard-shell";
import { getProviderKitchen } from "@/lib/data/provider";
import { requireUser } from "@/lib/session";

const LINKS: DashboardLink[] = [
  { href: "/provider/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/provider/orders", label: "Orders", icon: "ClipboardList" },
  { href: "/provider/menu", label: "Menu", icon: "UtensilsCrossed" },
  { href: "/provider/tiffin", label: "Tiffin plans", icon: "CookingPot" },
  { href: "/provider/kitchen", label: "Kitchen profile", icon: "Store" },
  { href: "/provider/reviews", label: "Reviews", icon: "MessageSquare" },
  { href: "/profile", label: "Account", icon: "UserRound" },
];

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["PROVIDER"]);
  const kitchen = await getProviderKitchen(user.id);
  return (
    <DashboardShell title="Home Cook" subtitle={kitchen?.kitchenName ?? user.name} links={LINKS}>
      {children}
    </DashboardShell>
  );
}
