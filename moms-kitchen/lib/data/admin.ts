import { connectDB } from "@/lib/db";
import { Category, Food, Kitchen, Order, Review, User } from "@/lib/models";
import { escapeRegex } from "@/lib/utils";
import type { KitchenStatus, OrderStatus, Role } from "@/types";
import {
  toCategoryDTO,
  toFoodDTO,
  toKitchenDTO,
  toOrderDTO,
  toReviewDTO,
  toUserDTO,
} from "./mappers";

export async function getAdminDashboard() {
  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [users, kitchens, orders, reviewCount, pendingKitchens, recentOrders] = await Promise.all([
    User.find().select("role isActive").lean(),
    Kitchen.find().select("status").lean(),
    Order.find().select("orderStatus totalAmount createdAt kitchen").lean(),
    Review.countDocuments(),
    Kitchen.find({ status: "PENDING" }).populate("owner", "name email").sort({ createdAt: 1 }).limit(5).lean(),
    Order.find()
      .populate("customer", "name")
      .populate("kitchen", "kitchenName")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const delivered = orders.filter((o) => o.orderStatus === "DELIVERED");
  const ordersByDay = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
    const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const count = orders.filter((o) => o.createdAt >= day && o.createdAt < next).length;
    return { label: day.toLocaleDateString("en-IN", { weekday: "short" }), amount: count };
  });

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.orderStatus] = (acc[order.orderStatus] ?? 0) + 1;
    return acc;
  }, {});

  // Top kitchens by delivered revenue
  const revenueByKitchen = new Map<string, number>();
  for (const order of delivered) {
    const key = String(order.kitchen);
    revenueByKitchen.set(key, (revenueByKitchen.get(key) ?? 0) + order.totalAmount);
  }
  const topIds = Array.from(revenueByKitchen.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topKitchenDocs = await Kitchen.find({ _id: { $in: topIds.map(([id]) => id) } })
    .select("kitchenName")
    .lean();
  const topKitchens = topIds.map(([id, revenue]) => ({
    id,
    name: topKitchenDocs.find((k) => String(k._id) === id)?.kitchenName ?? "Unknown",
    revenue,
  }));

  return {
    stats: {
      users: users.length,
      customers: users.filter((u) => u.role === "CUSTOMER").length,
      providers: users.filter((u) => u.role === "PROVIDER").length,
      blockedUsers: users.filter((u) => u.isActive === false).length,
      pendingKitchens: kitchens.filter((k) => k.status === "PENDING").length,
      activeKitchens: kitchens.filter((k) => k.status === "APPROVED").length,
      orders: orders.length,
      ordersToday: orders.filter((o) => o.createdAt >= today).length,
      revenue: delivered.reduce((sum, o) => sum + o.totalAmount, 0),
      reviews: reviewCount,
    },
    statusCounts,
    ordersByDay,
    topKitchens,
    pendingKitchens: pendingKitchens.map(toKitchenDTO),
    recentOrders: recentOrders.map(toOrderDTO),
  };
}

export async function listUsers(filters: { q?: string; role?: Role | "" }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.role) query.role = filters.role;
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q.slice(0, 60)), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }
  const docs = await User.find(query).sort({ createdAt: -1 }).limit(200).lean();
  return docs.map(toUserDTO);
}

export async function listKitchens(status?: KitchenStatus | "") {
  await connectDB();
  const docs = await Kitchen.find(status ? { status } : {})
    .populate("owner", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toKitchenDTO);
}

export async function listOrders(status?: OrderStatus | "") {
  await connectDB();
  const docs = await Order.find(status ? { orderStatus: status } : {})
    .populate("customer", "name phone")
    .populate("kitchen", "kitchenName phone")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return docs.map(toOrderDTO);
}

export async function listReviews() {
  await connectDB();
  const docs = await Review.find()
    .populate("customer", "name")
    .populate("kitchen", "kitchenName")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return docs.map(toReviewDTO);
}

export async function listCategoriesWithCounts() {
  await connectDB();
  const [categories, foods] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Food.find().select("category").lean(),
  ]);
  return categories.map((category) => ({
    ...toCategoryDTO(category),
    foodCount: foods.filter((food) => String(food.category) === String(category._id)).length,
  }));
}

export async function listFoods(q?: string) {
  await connectDB();
  const query = q ? { name: new RegExp(escapeRegex(q.slice(0, 60)), "i") } : {};
  const docs = await Food.find(query)
    .populate("kitchen", "kitchenName")
    .populate("category")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return docs.map(toFoodDTO);
}
