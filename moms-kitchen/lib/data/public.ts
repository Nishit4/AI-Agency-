/** Read-only queries for public pages (home, kitchens, food). */
import { isValidObjectId, type Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Category, Food, Kitchen, Order, Review, TiffinPlan, User } from "@/lib/models";
import { escapeRegex, toId } from "@/lib/utils";
import type { CategoryDTO, FoodDTO, KitchenDTO } from "@/types";
import {
  toCategoryDTO,
  toFoodDTO,
  toKitchenDTO,
  toReviewDTO,
  toTiffinDTO,
} from "./mappers";

export async function getCategories(): Promise<CategoryDTO[]> {
  await connectDB();
  const docs = await Category.find().sort({ name: 1 }).lean();
  return docs.map(toCategoryDTO);
}

async function approvedKitchenIds() {
  const docs = await Kitchen.find({ status: "APPROVED" }).select("_id").lean();
  return docs.map((doc) => doc._id);
}

/** Attach the list of cuisines (categories) each kitchen cooks. */
async function withCategories(kitchens: KitchenDTO[]) {
  if (kitchens.length === 0) return kitchens;
  const foods = await Food.find({ kitchen: { $in: kitchens.map((k) => k.id) } })
    .select("kitchen category")
    .populate("category")
    .lean();
  const byKitchen = new Map<string, Map<string, CategoryDTO>>();
  for (const food of foods) {
    if (!food.category || typeof food.category !== "object" || !("name" in food.category)) {
      continue;
    }
    const kitchenId = toId(food.kitchen);
    const category = toCategoryDTO(food.category as Record<string, unknown>);
    if (!byKitchen.has(kitchenId)) byKitchen.set(kitchenId, new Map());
    byKitchen.get(kitchenId)!.set(category.id, category);
  }
  return kitchens.map((kitchen) => ({
    ...kitchen,
    categories: Array.from(byKitchen.get(kitchen.id)?.values() ?? []),
  }));
}

export async function getPopularKitchens(limit = 6) {
  await connectDB();
  const docs = await Kitchen.find({ status: "APPROVED" })
    .sort({ rating: -1, ratingCount: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return withCategories(docs.map(toKitchenDTO));
}

/** Most ordered dishes, topped up with other available dishes. */
export async function getPopularFoods(limit = 8): Promise<FoodDTO[]> {
  await connectDB();
  const kitchenIds = await approvedKitchenIds();
  const baseFilter = { kitchen: { $in: kitchenIds }, isAvailable: true };

  const ranking: Array<{ _id: Types.ObjectId; count: number }> = await Order.aggregate([
    { $match: { orderStatus: { $nin: ["REJECTED", "CANCELLED"] } } },
    { $unwind: "$items" },
    { $match: { "items.itemType": "FOOD" } },
    { $group: { _id: "$items.itemId", count: { $sum: "$items.quantity" } } },
    { $sort: { count: -1 } },
    { $limit: 30 },
  ]);
  const rankedIds = ranking.map((row) => toId(row._id));

  const ranked = await Food.find({ ...baseFilter, _id: { $in: rankedIds } })
    .populate("kitchen", "kitchenName")
    .populate("category")
    .lean();
  ranked.sort((a, b) => rankedIds.indexOf(toId(a._id)) - rankedIds.indexOf(toId(b._id)));

  const result = ranked.slice(0, limit);
  if (result.length < limit) {
    const extra = await Food.find({ ...baseFilter, _id: { $nin: result.map((f) => f._id) } })
      .sort({ createdAt: -1 })
      .limit(limit - result.length)
      .populate("kitchen", "kitchenName")
      .populate("category")
      .lean();
    result.push(...extra);
  }
  return result.map(toFoodDTO);
}

export type KitchenFilters = {
  q?: string;
  category?: string;
  city?: string;
  pincode?: string;
  veg?: boolean;
  sort?: "rating" | "newest" | "name";
};

export async function searchKitchens(filters: KitchenFilters) {
  await connectDB();
  const query: Record<string, unknown> = { status: "APPROVED" };
  const and: Record<string, unknown>[] = [];

  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q.slice(0, 60)), "i");
    // Match kitchens by name/area, or kitchens that cook a matching dish
    const foodMatches = await Food.find({ name: regex }).select("kitchen").lean();
    and.push({
      $or: [
        { kitchenName: regex },
        { description: regex },
        { "address.area": regex },
        { _id: { $in: foodMatches.map((food) => food.kitchen) } },
      ],
    });
  }

  if (filters.category) {
    const category = await Category.findOne({ slug: filters.category }).lean();
    if (!category) return [];
    const foods = await Food.find({ category: category._id }).select("kitchen").lean();
    and.push({ _id: { $in: foods.map((food) => food.kitchen) } });
  }

  if (filters.city) {
    query["address.city"] = new RegExp(`^${escapeRegex(filters.city.slice(0, 60))}$`, "i");
  }

  if (filters.pincode) {
    const value = filters.pincode.trim().slice(0, 60);
    const regex = new RegExp(`^${escapeRegex(value)}$`, "i");
    and.push({ $or: [{ "address.pincode": value }, { serviceAreas: regex }] });
  }

  if (filters.veg) query.isPureVeg = true;
  if (and.length) query.$and = and;

  const sort: Record<string, 1 | -1> =
    filters.sort === "newest"
      ? { createdAt: -1 }
      : filters.sort === "name"
        ? { kitchenName: 1 }
        : { rating: -1, ratingCount: -1 };

  const docs = await Kitchen.find(query).sort(sort).limit(60).lean();
  return withCategories(docs.map(toKitchenDTO));
}

export async function getCities(): Promise<string[]> {
  await connectDB();
  const cities = await Kitchen.distinct("address.city", { status: "APPROVED" });
  return (cities as string[]).filter(Boolean).sort();
}

/**
 * Load a kitchen page. Approved kitchens are public; the owner and admins can
 * also preview kitchens that are pending or rejected.
 */
export async function getKitchenPage(id: string, viewer?: { id: string; role: string } | null) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Kitchen.findById(id).lean();
  if (!doc) return null;

  const isOwner = viewer && toId(doc.owner) === viewer.id;
  const isAdmin = viewer?.role === "ADMIN";
  if (doc.status !== "APPROVED" && !isOwner && !isAdmin) return null;

  const [foods, tiffins, reviews] = await Promise.all([
    Food.find({ kitchen: doc._id }).populate("category").sort({ name: 1 }).lean(),
    TiffinPlan.find({ kitchen: doc._id }).sort({ price: 1 }).lean(),
    Review.find({ kitchen: doc._id, isHidden: false })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const [kitchen] = await withCategories([toKitchenDTO(doc)]);
  return {
    kitchen,
    foods: foods.map(toFoodDTO),
    tiffins: tiffins.map(toTiffinDTO),
    reviews: reviews.map(toReviewDTO),
    isPreview: doc.status !== "APPROVED",
  };
}

export async function getFoodPage(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Food.findById(id).populate("category").lean();
  if (!doc) return null;
  const kitchenDoc = await Kitchen.findOne({ _id: doc.kitchen, status: "APPROVED" }).lean();
  if (!kitchenDoc) return null;

  const more = await Food.find({
    kitchen: kitchenDoc._id,
    _id: { $ne: doc._id },
    isAvailable: true,
  })
    .populate("category")
    .limit(4)
    .lean();

  return {
    food: toFoodDTO(doc),
    kitchen: toKitchenDTO(kitchenDoc),
    more: more.map(toFoodDTO),
  };
}

export async function getPlatformStats() {
  await connectDB();
  const kitchenIds = await approvedKitchenIds();
  const [kitchens, dishes, customers, delivered] = await Promise.all([
    Promise.resolve(kitchenIds.length),
    Food.countDocuments({ kitchen: { $in: kitchenIds } }),
    User.countDocuments({ role: "CUSTOMER" }),
    Order.countDocuments({ orderStatus: "DELIVERED" }),
  ]);
  return { kitchens, dishes, customers, delivered };
}
