import type { Metadata } from "next";
import Link from "next/link";
import { CartSummary } from "@/components/cart/cart-summary";
import { QuantityControl } from "@/components/cart/quantity-control";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FoodVisual } from "@/components/ui/food-visual";
import { PageHeader } from "@/components/ui/page-header";
import { clearCart } from "@/lib/actions/cart";
import { getCart } from "@/lib/data/cart";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const user = await requireUser(["CUSTOMER"]);
  const cart = await getCart(user.id);

  if (cart.lines.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" />
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          description="Find a home kitchen you like and add some delicious homemade food."
          actionHref="/kitchens"
          actionLabel="Browse kitchens"
        />
      </>
    );
  }

  const hasUnavailable = cart.lines.some((line) => !line.isAvailable);
  const canCheckout = cart.kitchenOpen && !hasUnavailable && cart.totalAmount > 0;

  return (
    <>
      <PageHeader
        title="Your cart"
        description={`${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} from ${cart.kitchenName}`}
        actions={
          <ActionButton action={clearCart} confirmMessage="Remove all items from your cart?" className="btn-ghost btn-sm text-red-600">
            Clear cart
          </ActionButton>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card divide-y divide-orange-50">
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-stone-600">
              Ordering from{" "}
              <Link href={`/kitchens/${cart.kitchenId}`} className="font-semibold text-brand-700 hover:underline">
                {cart.kitchenName}
              </Link>
            </p>
            <Link href={`/kitchens/${cart.kitchenId}`} className="text-sm font-medium text-brand-700 hover:underline">
              + Add more
            </Link>
          </div>
          {cart.lines.map((line) => (
            <div key={`${line.itemType}-${line.itemId}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <FoodVisual
                  image={line.image}
                  emoji={line.emoji}
                  alt={line.name}
                  seed={line.itemId}
                  className="h-14 w-14 shrink-0 rounded-xl"
                  emojiClassName="text-2xl"
                />
                <div className="min-w-0">
                  <p className="font-semibold">{line.name}</p>
                  <p className="text-sm text-stone-500">
                    {formatPrice(line.unitPrice)} each
                    {line.itemType === "TIFFIN" && " · Tiffin plan"}
                  </p>
                  {!line.isAvailable && <p className="text-xs font-semibold text-red-600">Currently unavailable — please remove</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <QuantityControl itemType={line.itemType} itemId={line.itemId} quantity={line.quantity} />
                <p className="w-20 text-right font-semibold">{formatPrice(line.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} totalAmount={cart.totalAmount}>
            {!cart.kitchenOpen && (
              <p className="mb-3 rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-700">
                {cart.kitchenName} is closed right now. You can check out when it reopens.
              </p>
            )}
            {canCheckout ? (
              <Link href="/checkout" className="btn-primary w-full">
                Proceed to checkout
              </Link>
            ) : (
              <button type="button" disabled className="btn-primary w-full">
                Proceed to checkout
              </button>
            )}
          </CartSummary>
        </div>
      </div>
    </>
  );
}
