import { ChefHat } from "lucide-react";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Mom's Kitchen home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <ChefHat className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-lg font-bold ${light ? "text-white" : "text-ink"}`}>
          Mom&apos;s Kitchen
        </span>
        <span className={`block text-[10px] font-medium uppercase tracking-widest ${light ? "text-orange-200" : "text-brand-700"}`}>
          Homemade · Local
        </span>
      </span>
    </Link>
  );
}
