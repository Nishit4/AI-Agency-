import type { Metadata } from "next";
import { ManageOrderCard } from "@/components/order/manage-order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { ORDER_STATUS_META } from "@/lib/constants";
import { listOrders } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const metadata: Metadata = { title: "All orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser(["ADMIN"]);
  const { status: raw } = await searchParams;
  const status = ORDER_STATUSES.includes(raw as OrderStatus) ? (raw as OrderStatus) : "";
  const orders = await listOrders(status);

  return (
    <>
      <PageHeader title="All orders" description="Monitor every order on the platform and step in when needed." />
      <Tabs
        active={status || "ALL"}
        tabs={[
          { key: "ALL", label: "All", href: "/admin/orders" },
          ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_META[s].label, href: `/admin/orders?status=${s}` })),
        ]}
      />
      {orders.length === 0 ? (
        <EmptyState emoji="📭" title="No orders found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <ManageOrderCard key={order.id} order={order} role="ADMIN" />
          ))}
        </div>
      )}
    </>
  );
}
