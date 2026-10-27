import { ActionButton } from "@/components/ui/action-button";
import { updateOrderStatus } from "@/lib/actions/order";
import { allowedNextStatuses } from "@/lib/order-rules";
import type { OrderStatus, Role } from "@/types";

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: "Accept",
  REJECTED: "Reject",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel order",
};

const ACTION_STYLE: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: "btn-success btn-sm",
  REJECTED: "btn-danger btn-sm",
  CANCELLED: "btn-secondary btn-sm text-red-700",
  DELIVERED: "btn-success btn-sm",
};

/** Buttons for the next valid order statuses for this role. */
export function OrderStatusActions({
  orderId,
  status,
  role,
}: {
  orderId: string;
  status: OrderStatus;
  role: Role;
}) {
  const next = allowedNextStatuses(status, role);
  if (next.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {next.map((target) => (
        <ActionButton
          key={target}
          action={updateOrderStatus.bind(null, orderId, target, "")}
          className={ACTION_STYLE[target] ?? "btn-primary btn-sm"}
          confirmMessage={
            target === "REJECTED" || target === "CANCELLED"
              ? `Are you sure you want to ${ACTION_LABEL[target]?.toLowerCase()}?`
              : undefined
          }
        >
          {ACTION_LABEL[target]}
        </ActionButton>
      ))}
    </div>
  );
}
