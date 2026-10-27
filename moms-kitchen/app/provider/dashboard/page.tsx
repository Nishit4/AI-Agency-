import { ClipboardList, IndianRupee, Star, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusActions } from "@/components/order/order-status-actions";
import { ActionButton } from "@/components/ui/action-button";
import { KitchenStatusBadge, OpenBadge, OrderStatusBadge } from "@/components/ui/badges";
import { BarChart } from "@/components/ui/bar-chart";
import { RatingStars } from "@/components/ui/rating";
import { StatCard } from "@/components/ui/stat-card";
import { toggleKitchenOpen } from "@/lib/actions/provider";
import { getProviderDashboard } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Home Cook dashboard" };

export default async function ProviderDashboardPage() {
  const { user, kitchen } = await requireProviderKitchen();
  const { stats, activeOrders, earningsByDay, recentReviews } = await getProviderDashboard(kitchen.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Namaste, {user.name.split(" ")[0]} 🙏</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold">{kitchen.kitchenName}</span>
            <KitchenStatusBadge status={kitchen.status} />
            <OpenBadge isOpen={kitchen.isOpen} />
          </div>
        </div>
        <ActionButton action={toggleKitchenOpen} className={kitchen.isOpen ? "btn-secondary" : "btn-success"}>
          {kitchen.isOpen ? "Close for orders" : "Open for orders"}
        </ActionButton>
      </section>

      {kitchen.status !== "APPROVED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {kitchen.status === "PENDING"
            ? "⏳ Your kitchen is awaiting admin approval. Add your menu and tiffin plans so you're ready to go live."
            : "Your kitchen is not live. Visit Kitchen profile for details."}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Orders today" value={stats.ordersToday} icon={ClipboardList} hint={`${stats.pending} waiting for you`} href="/provider/orders" />
        <StatCard label="Earnings today" value={formatPrice(stats.earningsToday)} icon={IndianRupee} tone="green" />
        <StatCard label="Total earnings" value={formatPrice(stats.totalEarnings)} icon={IndianRupee} tone="sky" hint={`${stats.deliveredCount} delivered orders`} />
        <StatCard
          label="Rating"
          value={kitchen.ratingCount ? kitchen.rating.toFixed(1) : "–"}
          icon={Star}
          tone="amber"
          hint={`${kitchen.ratingCount} reviews`}
          href="/provider/reviews"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Active orders ({stats.active})</h2>
            <Link href="/provider/orders" className="text-sm font-semibold text-brand-700 hover:underline">All orders</Link>
          </div>
          {activeOrders.length === 0 ? (
            <p className="text-sm text-stone-600">No active orders. New orders will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {activeOrders.map((order) => (
                <li key={order.id} className="rounded-xl border border-orange-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {order.customerName} · <span className="font-normal text-stone-500">#{order.orderNumber}</span>
                    </p>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {order.items.map((item) => `${item.nameSnapshot} × ${item.quantity}`).join(", ")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-stone-500">
                      {formatDateTime(order.createdAt)} · {formatPrice(order.totalAmount)}
                    </span>
                    <OrderStatusActions orderId={order.id} status={order.orderStatus} role="PROVIDER" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold">Earnings · last 7 days</h2>
          <p className="mb-4 text-xs text-stone-500">From delivered orders</p>
          <BarChart data={earningsByDay} format={(v) => `₹${v}`} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold">Your menu</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <Link href="/provider/menu" className="rounded-xl bg-orange-50 p-4 hover:bg-orange-100">
              <UtensilsCrossed className="mx-auto h-6 w-6 text-brand-600" />
              <p className="mt-2 text-2xl font-bold">{stats.foodCount}</p>
              <p className="text-xs text-stone-600">dishes · {stats.availableFoodCount} available</p>
            </Link>
            <Link href="/provider/tiffin" className="rounded-xl bg-orange-50 p-4 hover:bg-orange-100">
              <span className="text-2xl" aria-hidden>🍱</span>
              <p className="mt-1 text-2xl font-bold">{stats.tiffinCount}</p>
              <p className="text-xs text-stone-600">tiffin plans</p>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/provider/menu/new" className="btn-primary btn-sm">+ Add dish</Link>
            <Link href="/provider/tiffin/new" className="btn-secondary btn-sm">+ Add tiffin plan</Link>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Latest reviews</h2>
            <Link href="/provider/reviews" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-stone-600">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map((review) => (
                <li key={review.id} className="rounded-xl bg-orange-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{review.customerName}</p>
                    <RatingStars value={review.rating} />
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-stone-600">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
