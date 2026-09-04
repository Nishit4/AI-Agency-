import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type BadgeTone = "slate" | "green" | "amber" | "red" | "indigo" | "blue";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({
  tone = "slate",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
