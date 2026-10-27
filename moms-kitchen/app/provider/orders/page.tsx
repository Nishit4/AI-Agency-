import type { Metadata } from "next";
import { ManageOrderCard } from "@/components/order/manage-order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { getProviderOrders, type ProviderOrderFilter } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";

export const metadata: Metadata = { title: "Orders" };

const FILTERS: { key: ProviderOrderFilter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "New (pending)" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default async function ProviderOrdersPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { kitchen } = await requireProviderKitchen();
  const { filter: raw } = await searchParams;
  const filter = (FILTERS.find((f) => f.key === raw)?.key ?? "active") as ProviderOrderFilter;
  const orders = await getProviderOrders(kitchen.id, filter);

  return (
    <>
      <PageHeader title="Orders" description="Accept new orders and update their status as you cook and deliver." />
      <Tabs
        active={filter}
        tabs={FILTERS.map((f) => ({ key: f.key, label: f.label, href: `/provider/orders?filter=${f.key}` }))}
      />
      {orders.length === 0 ? (
        <EmptyState emoji="📭" title="No orders here" description="New orders from customers will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <ManageOrderCard key={order.id} order={order} role="PROVIDER" />
          ))}
        </div>
      )}
    </>
  );
}
