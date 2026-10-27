import type { KitchenStatus, OrderStatus, TiffinFrequency } from "@/types";

export const APP_NAME = "Mom's Kitchen";
export const APP_TAGLINE = "Fresh Homemade Food, From Local Kitchens";

/** Flat delivery fee, waived for larger orders. */
export const DELIVERY_FEE = 20;
export const FREE_DELIVERY_ABOVE = 299;
export const MAX_ITEM_QUANTITY = 20;

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; description: string; badge: string }
> = {
  PENDING: {
    label: "Pending",
    description: "Order created and waiting for the kitchen to respond",
    badge: "bg-amber-100 text-amber-800",
  },
  ACCEPTED: {
    label: "Accepted",
    description: "The kitchen accepted your order",
    badge: "bg-sky-100 text-sky-800",
  },
  PREPARING: {
    label: "Preparing",
    description: "Your food is being prepared",
    badge: "bg-indigo-100 text-indigo-800",
  },
  READY: {
    label: "Ready",
    description: "Food is ready for pickup / delivery",
    badge: "bg-violet-100 text-violet-800",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    description: "Your order has left the kitchen",
    badge: "bg-cyan-100 text-cyan-800",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Order delivered. Enjoy your meal!",
    badge: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Rejected",
    description: "The kitchen declined this order",
    badge: "bg-red-100 text-red-800",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "This order was cancelled",
    badge: "bg-stone-200 text-stone-700",
  },
};

/** The happy-path order of statuses, used by the status timeline. */
export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

export const KITCHEN_STATUS_META: Record<KitchenStatus, { label: string; badge: string }> = {
  PENDING: { label: "Pending approval", badge: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", badge: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", badge: "bg-red-100 text-red-800" },
  SUSPENDED: { label: "Suspended", badge: "bg-stone-200 text-stone-700" },
};

export const TIFFIN_FREQUENCY_LABEL: Record<TiffinFrequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export const DEFAULT_FOOD_EMOJI = "🍲";
