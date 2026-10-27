import { KITCHEN_STATUS_META, ORDER_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { KitchenStatus, OrderStatus } from "@/types";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className ?? "bg-stone-100 text-stone-700",
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export function KitchenStatusBadge({ status }: { status: KitchenStatus }) {
  const meta = KITCHEN_STATUS_META[status];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

/** Indian food labelling convention: green square = veg, red/brown = non-veg. */
export function VegMark({ isVeg, className }: { isVeg: boolean; className?: string }) {
  return (
    <span
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 bg-white",
        isVeg ? "border-green-600" : "border-red-700",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isVeg ? "bg-green-600" : "bg-red-700")} />
    </span>
  );
}

export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <Badge className="bg-green-100 text-green-800">
      <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Open now
    </Badge>
  ) : (
    <Badge className="bg-stone-200 text-stone-700">
      <span className="h-1.5 w-1.5 rounded-full bg-stone-500" /> Closed
    </Badge>
  );
}
