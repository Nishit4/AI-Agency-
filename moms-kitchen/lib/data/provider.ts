import { isValidObjectId } from "mongoose";
import { ACTIVE_ORDER_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Category, Food, Kitchen, Order, Review, TiffinPlan } from "@/lib/models";
import type { OrderStatus } from "@/types";
import {
  toCategoryDTO,
  toFoodDTO,
  toKitchenDTO,
  toOrderDTO,
  toReviewDTO,
  toTiffinDTO,
} from "./mappers";

export async function getProviderKitchen(userId: string) {
  await connectDB();
  const doc = await Kitchen.findOne({ owner: userId }).lean();
  return doc ? toKitchenDTO(doc) : null;
}

export async function getProviderFoods(kitchenId: string) {
  await connectDB();
  const docs = await Food.find({ kitchen: kitchenId }).populate("category").sort({ createdAt: -1 }).lean();
  return docs.map(toFoodDTO);
}

export async function getProviderFood(kitchenId: string, foodId: string) {
  if (!isValidObjectId(foodId)) return null;
  await connectDB();
  const doc = await Food.findOne({ _id: foodId, kitchen: kitchenId }).lean();
  return doc ? toFoodDTO(doc) : null;
}

export async function getProviderTiffins(kitchenId: string) {
  await connectDB();
  const docs = await TiffinPlan.find({ kitchen: kitchenId }).sort({ createdAt: -1 }).lean();
  return docs.map(toTiffinDTO);
}

export async function getProviderTiffin(kitchenId: string, tiffinId: string) {
  if (!isValidObjectId(tiffinId)) return null;
  await connectDB();
  const doc = await TiffinPlan.findOne({ _id: tiffinId, kitchen: kitchenId }).lean();
  return doc ? toTiffinDTO(doc) : null;
}

export async function getAllCategories() {
  await connectDB();
  const docs = await Category.find().sort({ name: 1 }).lean();
  return docs.map(toCategoryDTO);
}

export type ProviderOrderFilter = "active" | "pending" | "completed" | "all";

export async function getProviderOrders(kitchenId: string, filter: ProviderOrderFilter = "active") {
  await connectDB();
  const statusFilter: Record<ProviderOrderFilter, OrderStatus[] | null> = {
    active: ACTIVE_ORDER_STATUSES,
    pending: ["PENDING"],
    completed: ["DELIVERED", "REJECTED", "CANCELLED"],
    all: null,
  };
  const statuses = statusFilter[filter];
  const docs = await Order.find({
    kitchen: kitchenId,
    ...(statuses ? { orderStatus: { $in: statuses } } : {}),
  })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return docs.map(toOrderDTO);
}

export async function getProviderReviews(kitchenId: string) {
  await connectDB();
  const docs = await Review.find({ kitchen: kitchenId })
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return docs.map(toReviewDTO);
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getProviderDashboard(kitchenId: string) {
  await connectDB();
  const today = startOfDay();
  const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [orders, foodCount, availableFoodCount, tiffinCount, reviews] = await Promise.all([
    Order.find({ kitchen: kitchenId }).populate("customer", "name phone").sort({ createdAt: -1 }).lean(),
    Food.countDocuments({ kitchen: kitchenId }),
    Food.countDocuments({ kitchen: kitchenId, isAvailable: true }),
    TiffinPlan.countDocuments({ kitchen: kitchenId }),
    Review.find({ kitchen: kitchenId, isHidden: false })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const dtos = orders.map(toOrderDTO);
  const todayOrders = dtos.filter((o) => new Date(o.createdAt) >= today);
  const delivered = dtos.filter((o) => o.orderStatus === "DELIVERED");

  // Earnings per day for the last 7 days (delivered orders)
  const earningsByDay = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
    const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const amount = delivered
      .filter((o) => new Date(o.createdAt) >= day && new Date(o.createdAt) < next)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { label: day.toLocaleDateString("en-IN", { weekday: "short" }), amount };
  });

  return {
    stats: {
      ordersToday: todayOrders.length,
      pending: dtos.filter((o) => o.orderStatus === "PENDING").length,
      active: dtos.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.orderStatus)).length,
      earningsToday: delivered
        .filter((o) => new Date(o.createdAt) >= today)
        .reduce((sum, o) => sum + o.totalAmount, 0),
      totalEarnings: delivered.reduce((sum, o) => sum + o.totalAmount, 0),
      deliveredCount: delivered.length,
      foodCount,
      availableFoodCount,
      tiffinCount,
    },
    activeOrders: dtos.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.orderStatus)).slice(0, 5),
    earningsByDay,
    recentReviews: reviews.map(toReviewDTO),
  };
}
