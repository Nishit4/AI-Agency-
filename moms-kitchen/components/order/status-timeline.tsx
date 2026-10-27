import { Check, X } from "lucide-react";
import { ORDER_FLOW, ORDER_STATUS_META } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import type { OrderDTO } from "@/types";

/** Visual order progress: Pending → Accepted → Preparing → Ready → Out for delivery → Delivered. */
export function StatusTimeline({ order }: { order: OrderDTO }) {
  const historyAt = (status: string) => order.statusHistory.find((event) => event.status === status)?.at;
  const terminal = order.orderStatus === "REJECTED" || order.orderStatus === "CANCELLED";

  if (terminal) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <X className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold text-red-800">{ORDER_STATUS_META[order.orderStatus].label}</p>
          <p className="text-sm text-red-700">{order.cancelReason || ORDER_STATUS_META[order.orderStatus].description}</p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);
  return (
    <ol className="relative space-y-0">
      {ORDER_FLOW.map((status, index) => {
        const done = index < currentIndex || order.orderStatus === "DELIVERED";
        const current = index === currentIndex && order.orderStatus !== "DELIVERED";
        const at = historyAt(status);
        const skipped = !at && index < currentIndex; // e.g. pickup orders skip "out for delivery"
        return (
          <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
            {index < ORDER_FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                  index < currentIndex ? "bg-green-500" : "bg-orange-100",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                done && "border-green-500 bg-green-500 text-white",
                current && "border-brand-600 bg-brand-600 text-white ring-4 ring-brand-100",
                !done && !current && "border-orange-200 bg-white text-stone-400",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <div className={cn("pt-1", !done && !current && "opacity-60", skipped && "opacity-50")}>
              <p className={cn("text-sm font-semibold", current && "text-brand-700")}>
                {ORDER_STATUS_META[status].label}
                {skipped && <span className="ml-1 font-normal text-stone-500">(skipped)</span>}
              </p>
              <p className="text-xs text-stone-500">
                {at ? formatDateTime(at) : ORDER_STATUS_META[status].description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
