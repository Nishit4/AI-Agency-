import { IndianRupee, MapPin, MessageSquare, Package, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { KitchenCard } from "@/components/kitchen/kitchen-card";
import { OrderCard } from "@/components/order/order-card";
import { StatusTimeline } from "@/components/order/status-timeline";
import { OrderStatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getCart } from "@/lib/data/cart";
import { getCustomerDashboard } from "@/lib/data/customer";
import { getPopularKitchens } from "@/lib/data/public";
import { requireUser } from "@/lib/session";
import { formatPrice, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "My dashboard" };

export default async function CustomerDashboardPage() {
  const user = await requireUser(["CUSTOMER"]);
  const [dashboard, cart, recommended] = await Promise.all([
    getCustomerDashboard(user.id),
    getCart(user.id),
    getPopularKitchens(3),
  ]);
  const { stats, activeOrders, orders, addresses } = dashboard;
  const activeOrder = activeOrders[0];

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-800">
          {initials(user.name)}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-stone-600">
            {user.email} · {user.phone || "No phone added"}
          </p>
        </div>
        <Link href="/profile" className="btn-secondary">Edit profile</Link>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Orders" value={stats.totalOrders} icon={Package} href="/customer/orders" />
        <StatCard label="Delivered" value={stats.delivered} icon={Package} tone="green" />
        <StatCard label="Total spent" value={formatPrice(stats.totalSpent)} icon={IndianRupee} tone="sky" />
        <StatCard label="To review" value={stats.pendingReviews} icon={MessageSquare} tone="amber" href="/customer/orders" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Active order */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Active order</h2>
            {activeOrder && <OrderStatusBadge status={activeOrder.orderStatus} />}
          </div>
          {activeOrder ? (
            <>
              <p className="mb-4 text-sm text-stone-600">
                <span className="font-semibold text-ink">{activeOrder.kitchenName}</span> · #{activeOrder.orderNumber} ·{" "}
                {formatPrice(activeOrder.totalAmount)}
              </p>
              <StatusTimeline order={activeOrder} />
              <Link href={`/customer/orders/${activeOrder.id}`} className="btn-secondary mt-4 w-full">
                View order details
              </Link>
              {activeOrders.length > 1 && (
                <p className="mt-2 text-center text-xs text-stone-500">+{activeOrders.length - 1} more active order(s)</p>
              )}
            </>
          ) : (
            <p className="text-sm text-stone-600">No active orders right now. Hungry? 🍛</p>
          )}
        </section>

        <div className="space-y-6">
          {/* Cart */}
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5 text-brand-600" /> Cart
              </h2>
              <Link href="/customer/cart" className="text-sm font-semibold text-brand-700 hover:underline">Open</Link>
            </div>
            {cart.lines.length ? (
              <p className="mt-2 text-sm text-stone-600">
                {cart.itemCount} item(s) from <span className="font-semibold text-ink">{cart.kitchenName}</span> ·{" "}
                {formatPrice(cart.totalAmount)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-stone-600">Your cart is empty.</p>
            )}
          </section>

          {/* Addresses */}
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-brand-600" /> Saved addresses
              </h2>
              <Link href="/customer/addresses" className="text-sm font-semibold text-brand-700 hover:underline">Manage</Link>
            </div>
            {addresses.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {addresses.slice(0, 3).map((address) => (
                  <li key={address.id} className="rounded-lg bg-orange-50 px-3 py-2">
                    <span className="font-semibold">{address.label}:</span> {address.addressLine}, {address.city} – {address.pincode}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-stone-600">No addresses saved yet.</p>
            )}
          </section>
        </div>
      </div>

      {/* Recent orders */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <Link href="/customer/orders" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
        </div>
        {orders.length ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} href={`/customer/orders/${order.id}`} />
            ))}
          </div>
        ) : (
          <EmptyState emoji="🧾" title="No orders yet" description="Your orders will appear here." actionHref="/kitchens" actionLabel="Order now" />
        )}
      </section>

      {/* Recommended */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Recommended kitchens</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {recommended.map((kitchen) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))}
        </div>
      </section>
    </div>
  );
}
