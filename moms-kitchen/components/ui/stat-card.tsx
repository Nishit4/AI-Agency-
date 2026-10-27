import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  href?: string;
  tone?: "brand" | "green" | "amber" | "sky" | "rose";
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    rose: "bg-rose-100 text-rose-700",
  };
  const content = (
    // Icon sits above the text on phones so labels never get cut off
    <div className="card flex h-full flex-col items-start gap-3 p-4 transition hover:border-orange-200 sm:flex-row sm:items-center sm:gap-4">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase leading-tight tracking-wide text-stone-500">{label}</p>
        <p className="text-xl font-bold text-ink sm:text-2xl">{value}</p>
        {hint && <p className="text-xs leading-snug text-stone-500">{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
