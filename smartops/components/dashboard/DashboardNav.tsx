"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/approvals", label: "Approvals" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/integrations", label: "Integrations" },
  { href: "/dashboard/finance", label: "Finance" },
  { href: "/dashboard/marketing", label: "Marketing" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6">
      <div className="mb-8 px-2 text-lg font-bold text-slate-900">SmartOps</div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
