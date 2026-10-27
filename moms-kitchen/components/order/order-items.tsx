import { formatPrice } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export function OrderItems({ order }: { order: OrderDTO }) {
  return (
    <div>
      <ul className="divide-y divide-orange-50">
        {order.items.map((item, index) => (
          <li key={`${item.itemId}-${index}`} className="flex items-start justify-between gap-3 py-2.5 text-sm">
            <div>
              <p className="font-medium">
                {item.nameSnapshot}
                {item.itemType === "TIFFIN" && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800">Tiffin plan</span>
                )}
              </p>
              <p className="text-xs text-stone-500">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.subtotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1.5 border-t border-dashed border-orange-200 pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Item total</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-600">Delivery fee</dt>
          <dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : "FREE"}</dd>
        </div>
        <div className="flex justify-between text-base font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalAmount)}</dd>
        </div>
        <div className="flex justify-between text-xs text-stone-500">
          <dt>Payment</dt>
          <dd>
            {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod} · {order.paymentStatus.toLowerCase()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
