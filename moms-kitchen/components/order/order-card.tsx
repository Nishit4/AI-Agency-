import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/badges";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export function OrderCard({ order, href }: { order: OrderDTO; href: string }) {
  const summary = order.items.map((item) => `${item.nameSnapshot} × ${item.quantity}`).join(", ");
  return (
    <Link href={href} className="card flex items-center gap-4 p-4 transition hover:border-orange-200">
      <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl sm:flex" aria-hidden>
        🧾
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{order.kitchenName ?? order.customerName}</p>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <p className="mt-0.5 truncate text-sm text-stone-600">{summary}</p>
        <p className="mt-0.5 text-xs text-stone-500">
          #{order.orderNumber} · {formatDateTime(order.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatPrice(order.totalAmount)}</p>
        <ChevronRight className="ml-auto mt-1 h-4 w-4 text-stone-400" />
      </div>
    </Link>
  );
}
