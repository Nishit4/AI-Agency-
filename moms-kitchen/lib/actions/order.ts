"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/data/cart";
import { connectDB } from "@/lib/db";
import { Address, Cart, Kitchen, Order } from "@/lib/models";
import { calculateTotals, canTransition, generateOrderNumber } from "@/lib/order-rules";
import { getCurrentUser, requireUser } from "@/lib/session";
import { ORDER_STATUS_META } from "@/lib/constants";
import { checkoutSchema, formToObject } from "@/lib/validations";
import { toId } from "@/lib/utils";
import { ORDER_STATUSES, type ActionState, type OrderStatus } from "@/types";
import { failure, fieldErrors, success } from "./helpers";

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["CUSTOMER"]);
  const parsed = checkoutSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fieldErrors(parsed.error, formData);
  const { addressId, notes } = parsed.data;

  await connectDB();
  if (!isValidObjectId(addressId)) return failure("Choose a delivery address.");
  const address = await Address.findOne({ _id: addressId, user: user.id }).lean();
  if (!address) return failure("Choose a valid delivery address.");

  // Prices and availability are read again from the database right now
  const cart = await getCart(user.id);
  if (!cart.kitchenId || cart.lines.length === 0) return failure("Your cart is empty.");
  if (!cart.kitchenOpen) return failure(`${cart.kitchenName} is not accepting orders right now.`);
  const unavailable = cart.lines.filter((line) => !line.isAvailable);
  if (unavailable.length) {
    return failure(
      `Please remove unavailable items: ${unavailable.map((line) => line.name).join(", ")}.`,
    );
  }

  const kitchen = await Kitchen.findById(cart.kitchenId).lean();
  if (!kitchen || kitchen.status !== "APPROVED") return failure("This kitchen is not available.");

  const items = cart.lines.map((line) => ({
    itemType: line.itemType,
    itemId: line.itemId,
    nameSnapshot: line.name,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    subtotal: line.unitPrice * line.quantity,
  }));
  const totals = calculateTotals(items);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: user.id,
    kitchen: kitchen._id,
    items,
    ...totals,
    address: address._id,
    addressSnapshot: {
      label: address.label,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark,
    },
    contactPhone: user.phone ?? "",
    notes,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
    statusHistory: [{ status: "PENDING", at: new Date(), note: "Order placed" }],
  });

  await Cart.updateOne({ user: user.id }, { items: [], kitchen: null, totalAmount: 0 });
  revalidatePath("/", "layout");
  redirect(`/customer/orders/${toId(order._id)}?placed=1`);
}

/**
 * Move an order to a new status. Customers may cancel pending orders,
 * providers manage orders of their own kitchen, admins manage all orders.
 */
export async function updateOrderStatus(orderId: string, next: OrderStatus, note = ""): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure("Please log in.");
  if (!isValidObjectId(orderId) || !ORDER_STATUSES.includes(next)) return failure("Invalid request.");

  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order) return failure("Order not found.");

  if (user.role === "CUSTOMER" && toId(order.customer) !== user.id) return failure("Order not found.");
  if (user.role === "PROVIDER") {
    const kitchen = await Kitchen.findOne({ owner: user.id }).select("_id").lean();
    if (!kitchen || toId(kitchen._id) !== toId(order.kitchen)) return failure("Order not found.");
  }

  const current = order.orderStatus as OrderStatus;
  if (!canTransition(current, next, user.role)) {
    return failure(`Cannot change an order from ${ORDER_STATUS_META[current].label} to ${ORDER_STATUS_META[next].label}.`);
  }

  const update: Record<string, unknown> = {
    orderStatus: next,
    $push: { statusHistory: { status: next, at: new Date(), note: note.slice(0, 200) } },
  };
  if (next === "DELIVERED") update.paymentStatus = "PAID";
  if (next === "CANCELLED" || next === "REJECTED") {
    update.cancelReason =
      note.slice(0, 200) || (next === "REJECTED" ? "Declined by the kitchen" : `Cancelled by ${user.role.toLowerCase()}`);
  }

  // Only apply if nobody changed the status in the meantime
  const result = await Order.updateOne({ _id: order._id, orderStatus: current }, update);
  if (result.modifiedCount === 0) return failure("The order was updated by someone else. Please refresh.");

  revalidatePath("/customer", "layout");
  revalidatePath("/provider", "layout");
  revalidatePath("/admin", "layout");
  return success(`Order marked as ${ORDER_STATUS_META[next].label}.`);
}

export async function cancelOrder(orderId: string): Promise<ActionState> {
  return updateOrderStatus(orderId, "CANCELLED", "Cancelled by customer");
}
