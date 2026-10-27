import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link-based tabs (state lives in the URL, so it works without JavaScript). */
export function Tabs({
  tabs,
  active,
}: {
  tabs: { key: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
            active === tab.key ? "border-ink bg-ink text-white" : "border-orange-200 bg-white hover:bg-brand-50",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn("rounded-full px-1.5 text-xs", active === tab.key ? "bg-white/20" : "bg-orange-100")}>{tab.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
