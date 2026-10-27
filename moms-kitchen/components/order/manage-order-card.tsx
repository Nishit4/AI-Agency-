import { MapPin, Phone, StickyNote } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/badges";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { OrderDTO, Role } from "@/types";
import { OrderStatusActions } from "./order-status-actions";

/** Order card with customer details and status buttons (provider & admin). */
export function ManageOrderCard({ order, role }: { order: OrderDTO; role: Role }) {
  const phone = order.contactPhone || order.customerPhone;
  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            #{order.orderNumber}
            {role === "ADMIN" && order.kitchenName && <span className="font-normal text-stone-500"> · {order.kitchenName}</span>}
          </p>
          <p className="text-xs text-stone-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item, index) => (
          <li key={`${item.itemId}-${index}`} className="flex justify-between gap-3">
            <span>
              {item.nameSnapshot} <span className="text-stone-500">× {item.quantity}</span>
            </span>
            <span className="text-stone-600">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-dashed border-orange-200 pt-2 text-sm font-bold">
        <span>Total ({order.paymentMethod === "COD" ? "cash on delivery" : order.paymentMethod})</span>
        <span>{formatPrice(order.totalAmount)}</span>
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-orange-50/70 p-3 text-sm sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>
            <span className="font-semibold">{order.customerName}</span>
            <br />
            {order.addressSnapshot.addressLine}, {order.addressSnapshot.city} – {order.addressSnapshot.pincode}
          </span>
        </p>
        <div className="space-y-1">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-brand-700">
              <Phone className="h-4 w-4 text-brand-600" /> {phone}
            </a>
          )}
          {order.notes && (
            <p className="flex items-start gap-2">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {order.notes}
            </p>
          )}
        </div>
      </div>

      {order.cancelReason && (order.orderStatus === "REJECTED" || order.orderStatus === "CANCELLED") && (
        <p className="mt-2 text-xs text-red-700">Reason: {order.cancelReason}</p>
      )}

      <div className="mt-3">
        <OrderStatusActions orderId={order.id} status={order.orderStatus} role={role} />
      </div>
    </article>
  );
}
