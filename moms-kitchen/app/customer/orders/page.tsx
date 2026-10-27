import type { Metadata } from "next";
import { OrderCard } from "@/components/order/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCustomerOrders } from "@/lib/data/customer";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "My orders" };

export default async function CustomerOrdersPage() {
  const user = await requireUser(["CUSTOMER"]);
  const orders = await getCustomerOrders(user.id);

  return (
    <>
      <PageHeader title="My orders" description="Track your current orders and see your order history." />
      {orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} href={`/customer/orders/${order.id}`} />
              {order.orderStatus === "DELIVERED" && !order.hasReview && (
                <p className="mt-1 px-2 text-xs font-medium text-brand-700">⭐ Rate this order — open it to leave a review</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState emoji="🧾" title="No orders yet" description="When you place an order it will show up here." actionHref="/kitchens" actionLabel="Browse kitchens" />
      )}
    </>
  );
}
