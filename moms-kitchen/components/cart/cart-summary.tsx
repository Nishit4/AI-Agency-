import { FREE_DELIVERY_ABOVE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function CartSummary({
  subtotal,
  deliveryFee,
  totalAmount,
  children,
}: {
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Bill summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Item total</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-600">Delivery fee</dt>
          <dd className="font-medium">{deliveryFee === 0 ? <span className="text-green-700">FREE</span> : formatPrice(deliveryFee)}</dd>
        </div>
        {deliveryFee > 0 && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
            Add {formatPrice(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery
          </p>
        )}
        <div className="flex justify-between border-t border-dashed border-orange-200 pt-3 text-base">
          <dt className="font-bold">To pay</dt>
          <dd className="font-bold">{formatPrice(totalAmount)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
