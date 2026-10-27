/**
 * Pure business rules for carts and orders.
 * Kept free of database code so they can be unit-tested (see tests/).
 */
import type { OrderStatus, Role } from "@/types";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/constants";

/** Status changes a kitchen (provider) may make. */
const PROVIDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  REJECTED: [],
  CANCELLED: [],
};

/**
 * Which statuses `role` may move an order to from `current`.
 * - Customers can only cancel while the order is still pending.
 * - Admins can do everything a provider can, and can also cancel any active order.
 */
export function allowedNextStatuses(current: OrderStatus, role: Role): OrderStatus[] {
  if (role === "CUSTOMER") {
    return current === "PENDING" ? ["CANCELLED"] : [];
  }
  const next = [...PROVIDER_TRANSITIONS[current]];
  if (role === "ADMIN" && isActiveStatus(current)) {
    next.push("CANCELLED");
  }
  return next;
}

export function canTransition(current: OrderStatus, next: OrderStatus, role: Role) {
  return allowedNextStatuses(current, role).includes(next);
}

export function isActiveStatus(status: OrderStatus) {
  return !["DELIVERED", "REJECTED", "CANCELLED"].includes(status);
}

/** A review is allowed only after the order has been delivered. */
export function canReviewOrder(status: OrderStatus, alreadyReviewed: boolean) {
  return status === "DELIVERED" && !alreadyReviewed;
}

export type PricedLine = { unitPrice: number; quantity: number };

/**
 * Calculates order totals. Always called on the server with prices read from
 * the database — prices sent by the browser are never trusted.
 */
export function calculateTotals(lines: PricedLine[]) {
  const subtotal = lines.reduce(
    (sum, line) => sum + roundMoney(line.unitPrice) * Math.max(0, Math.floor(line.quantity)),
    0,
  );
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, totalAmount: subtotal + deliveryFee };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Human friendly order number, e.g. MK-261027-4821 */
export function generateOrderNumber(date = new Date()) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MK-${y}${m}${d}-${random}`;
}
