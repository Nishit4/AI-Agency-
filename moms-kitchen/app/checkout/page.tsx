import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CartSummary } from "@/components/cart/cart-summary";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { AddressForm } from "@/components/forms/address-form";
import { getCart } from "@/lib/data/cart";
import { getAddresses } from "@/lib/data/customer";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser(["CUSTOMER"]);
  const [cart, addresses] = await Promise.all([getCart(user.id), getAddresses(user.id)]);
  if (cart.lines.length === 0) redirect("/customer/cart");

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-stone-600">
        Ordering from <span className="font-semibold">{cart.kitchenName}</span>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <CheckoutForm addresses={addresses} totalAmount={cart.totalAmount} />
          <details className="card p-5" open={addresses.length === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-brand-700">+ Add a new delivery address</summary>
            <div className="mt-4">
              <AddressForm />
            </div>
          </details>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-bold">Order summary</h2>
            <ul className="mt-3 divide-y divide-orange-50 text-sm">
              {cart.lines.map((line) => (
                <li key={`${line.itemType}-${line.itemId}`} className="flex justify-between gap-3 py-2">
                  <span className={line.isAvailable ? "" : "text-red-600 line-through"}>
                    {line.emoji} {line.name} × {line.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(line.subtotal)}</span>
                </li>
              ))}
            </ul>
            <Link href="/customer/cart" className="mt-2 inline-block text-xs font-medium text-brand-700 hover:underline">
              Edit cart
            </Link>
          </div>
          <CartSummary subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} totalAmount={cart.totalAmount} />
        </aside>
      </div>
    </div>
  );
}
