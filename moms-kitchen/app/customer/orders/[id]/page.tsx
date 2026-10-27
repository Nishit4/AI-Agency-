import { MapPin, Phone, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/forms/review-form";
import { OrderItems } from "@/components/order/order-items";
import { StatusTimeline } from "@/components/order/status-timeline";
import { ActionButton } from "@/components/ui/action-button";
import { OrderStatusBadge } from "@/components/ui/badges";
import { RatingStars } from "@/components/ui/rating";
import { cancelOrder } from "@/lib/actions/order";
import { getCustomerOrder } from "@/lib/data/customer";
import { canReviewOrder } from "@/lib/order-rules";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };

export default async function CustomerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const user = await requireUser(["CUSTOMER"]);
  const [{ id }, { placed }] = await Promise.all([params, searchParams]);
  const data = await getCustomerOrder(user.id, id);
  if (!data) notFound();
  const { order, review } = data;

  return (
    <div className="space-y-6">
      {placed && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
          <p className="text-lg font-bold">🎉 Order placed successfully!</p>
          <p className="text-sm">
            {order.kitchenName} will confirm your order shortly. You can track its progress on this page.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/customer/orders" className="text-sm font-medium text-brand-700 hover:underline">← My orders</Link>
          <h1 className="mt-1 text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-stone-600">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          {order.orderStatus === "PENDING" && (
            <ActionButton
              action={cancelOrder.bind(null, order.id)}
              confirmMessage="Cancel this order?"
              className="btn-secondary btn-sm text-red-700"
            >
              Cancel order
            </ActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold">Order status</h2>
            <StatusTimeline order={order} />
          </section>

          <section className="card p-5">
            <h2 className="mb-2 text-lg font-bold">Items from {order.kitchenName}</h2>
            <OrderItems order={order} />
          </section>

          {order.orderStatus === "DELIVERED" && (
            <section className="card p-5">
              <h2 className="mb-4 text-lg font-bold">Your review</h2>
              {review ? (
                <div>
                  <RatingStars value={review.rating} size="md" />
                  {review.comment && <p className="mt-2 text-sm text-stone-700">{review.comment}</p>}
                </div>
              ) : canReviewOrder(order.orderStatus, Boolean(review)) ? (
                <ReviewForm orderId={order.id} />
              ) : null}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="card space-y-3 p-5 text-sm">
            <h2 className="text-lg font-bold">Delivery details</h2>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>
                <span className="font-semibold">{order.addressSnapshot.label}</span>
                <br />
                {order.addressSnapshot.addressLine}, {order.addressSnapshot.city} – {order.addressSnapshot.pincode}
                {order.addressSnapshot.landmark && (
                  <>
                    <br />
                    <span className="text-stone-500">Landmark: {order.addressSnapshot.landmark}</span>
                  </>
                )}
              </span>
            </p>
            {order.notes && (
              <p className="flex items-start gap-2">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{order.notes}</span>
              </p>
            )}
          </section>
          <section className="card space-y-2 p-5 text-sm">
            <h2 className="text-lg font-bold">Kitchen</h2>
            <Link href={`/kitchens/${order.kitchenId}`} className="font-semibold text-brand-700 hover:underline">
              {order.kitchenName}
            </Link>
            {order.kitchenPhone && (
              <a href={`tel:${order.kitchenPhone}`} className="flex items-center gap-2 text-stone-700 hover:text-brand-700">
                <Phone className="h-4 w-4" /> {order.kitchenPhone}
              </a>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
