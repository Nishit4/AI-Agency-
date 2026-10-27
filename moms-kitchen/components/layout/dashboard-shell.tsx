"use client";

import {
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  Tags,
  UserRound,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Icons are looked up by name so server layouts can pass plain strings
const ICONS = {
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  Tags,
  UserRound,
  Users,
  UtensilsCrossed,
} satisfies Record<string, LucideIcon>;

export type DashboardLink = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

/**
 * Dashboard layout: a sidebar on desktop, a horizontally scrolling tab bar on
 * phones and tablets.
 */
export function DashboardShell({
  title,
  subtitle,
  links,
  children,
}: {
  title: string;
  subtitle?: string;
  links: DashboardLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="container-page py-6 lg:py-8">
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 hidden lg:block">
              <p className="font-display text-lg font-bold">{title}</p>
              {subtitle && <p className="truncate text-sm text-stone-500">{subtitle}</p>}
            </div>
            <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
              {links.map((link) => {
                const Icon = ICONS[link.icon];
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-orange-100 bg-white text-stone-700 hover:bg-brand-50 lg:border-transparent lg:bg-transparent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
