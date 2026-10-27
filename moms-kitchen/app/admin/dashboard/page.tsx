import { ClipboardList, IndianRupee, MessageSquare, Store, UserRound, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApprovalPanel } from "@/components/approval-panel";
import { OrderStatusBadge } from "@/components/ui/badges";
import { BarChart } from "@/components/ui/bar-chart";
import { StatCard } from "@/components/ui/stat-card";
import { ORDER_STATUS_META } from "@/lib/constants";
import { getAdminDashboard } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  await requireUser(["ADMIN"]);
  const data = await getAdminDashboard();
  const { stats } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin dashboard</h1>
        <p className="text-sm text-stone-600">Platform overview and moderation</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Users" value={stats.users} icon={Users} hint={`${stats.customers} customers · ${stats.providers} cooks`} href="/admin/users" />
        <StatCard label="Pending providers" value={stats.pendingKitchens} icon={UserRound} tone="amber" href="/admin/providers?status=PENDING" />
        <StatCard label="Active kitchens" value={stats.activeKitchens} icon={Store} tone="green" href="/admin/providers?status=APPROVED" />
        <StatCard label="Orders" value={stats.orders} icon={ClipboardList} tone="sky" hint={`${stats.ordersToday} today`} href="/admin/orders" />
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} icon={IndianRupee} tone="green" hint="Delivered orders (GMV)" />
        <StatCard label="Reviews" value={stats.reviews} icon={MessageSquare} tone="rose" href="/admin/reviews" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Pending provider approvals</h2>
            <Link href="/admin/providers?status=PENDING" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
          </div>
          {data.pendingKitchens.length === 0 ? (
            <p className="text-sm text-stone-600">🎉 No kitchens waiting for approval.</p>
          ) : (
            <ul className="space-y-3">
              {data.pendingKitchens.map((kitchen) => (
                <li key={kitchen.id} className="rounded-xl border border-orange-100 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/kitchens/${kitchen.id}`} className="font-semibold hover:text-brand-700">{kitchen.kitchenName}</Link>
                      <p className="text-xs text-stone-500">
                        {kitchen.ownerName} · {kitchen.address.area}, {kitchen.address.city} · applied {formatDate(kitchen.createdAt)}
                      </p>
                    </div>
                    <ApprovalPanel kitchenId={kitchen.id} status={kitchen.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold">Orders · last 7 days</h2>
          <p className="mb-4 text-xs text-stone-500">Number of orders placed per day</p>
          <BarChart data={data.ordersByDay} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">All orders</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Kitchen</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-xs text-stone-500">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.kitchenName}</td>
                    <td className="font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td><OrderStatusBadge status={order.orderStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Orders by status</h2>
            <ul className="space-y-2 text-sm">
              {ORDER_STATUSES.map((status) => (
                <li key={status} className="flex items-center justify-between">
                  <span className="text-stone-600">{ORDER_STATUS_META[status].label}</span>
                  <span className="font-semibold">{data.statusCounts[status] ?? 0}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Top kitchens by revenue</h2>
            {data.topKitchens.length === 0 ? (
              <p className="text-sm text-stone-600">No delivered orders yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {data.topKitchens.map((kitchen, index) => (
                  <li key={kitchen.id} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="mr-2 font-bold text-brand-700">{index + 1}.</span>
                      {kitchen.name}
                    </span>
                    <span className="font-semibold">{formatPrice(kitchen.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
