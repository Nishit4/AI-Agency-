import { isValidObjectId } from "mongoose";
import { ACTIVE_ORDER_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Address, Order, Review } from "@/lib/models";
import { toId } from "@/lib/utils";
import { toAddressDTO, toOrderDTO } from "./mappers";

export async function getAddresses(userId: string) {
  await connectDB();
  const docs = await Address.find({ user: userId }).sort({ createdAt: 1 }).lean();
  return docs.map(toAddressDTO);
}

export async function getCustomerOrders(userId: string, limit = 50) {
  await connectDB();
  const docs = await Order.find({ customer: userId })
    .populate("kitchen", "kitchenName phone")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  const reviewed = await Review.find({ order: { $in: docs.map((d) => d._id) } })
    .select("order")
    .lean();
  const reviewedIds = new Set(reviewed.map((r) => toId(r.order)));
  return docs.map((doc) => ({ ...toOrderDTO(doc), hasReview: reviewedIds.has(toId(doc._id)) }));
}

/** A single order — only if it belongs to this customer. */
export async function getCustomerOrder(userId: string, orderId: string) {
  if (!isValidObjectId(orderId)) return null;
  await connectDB();
  const doc = await Order.findOne({ _id: orderId, customer: userId })
    .populate("kitchen", "kitchenName phone")
    .lean();
  if (!doc) return null;
  const review = await Review.findOne({ order: doc._id }).lean();
  return {
    order: { ...toOrderDTO(doc), hasReview: Boolean(review) },
    review: review ? { rating: review.rating, comment: review.comment ?? "" } : null,
  };
}

export async function getCustomerDashboard(userId: string) {
  const [orders, addresses] = await Promise.all([
    getCustomerOrders(userId, 20),
    getAddresses(userId),
  ]);
  const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.orderStatus));
  const delivered = orders.filter((o) => o.orderStatus === "DELIVERED");
  return {
    orders,
    activeOrders,
    addresses,
    stats: {
      totalOrders: orders.length,
      delivered: delivered.length,
      totalSpent: delivered.reduce((sum, o) => sum + o.totalAmount, 0),
      pendingReviews: delivered.filter((o) => !o.hasReview).length,
    },
  };
}
