import { connectDB } from "@/lib/db";
import { DEFAULT_FOOD_EMOJI } from "@/lib/constants";
import { Cart, Food, Kitchen, TiffinPlan } from "@/lib/models";
import { calculateTotals } from "@/lib/order-rules";
import { toId } from "@/lib/utils";
import type { CartDTO, CartLineDTO } from "@/types";

const EMPTY_CART: CartDTO = {
  kitchenId: null,
  kitchenName: null,
  kitchenOpen: false,
  lines: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  totalAmount: 0,
};

/**
 * Loads the user's cart with CURRENT prices from the database and calculates
 * totals on the server. Unavailable items are listed but not counted.
 */
export async function getCart(userId: string): Promise<CartDTO> {
  await connectDB();
  const cart = await Cart.findOne({ user: userId }).lean();
  if (!cart || cart.items.length === 0) return EMPTY_CART;

  const foodIds = cart.items.filter((i) => i.itemType === "FOOD").map((i) => i.itemId);
  const tiffinIds = cart.items.filter((i) => i.itemType === "TIFFIN").map((i) => i.itemId);

  const [kitchen, foods, tiffins] = await Promise.all([
    cart.kitchen ? Kitchen.findById(cart.kitchen).lean() : null,
    Food.find({ _id: { $in: foodIds } }).populate("category", "emoji").lean(),
    TiffinPlan.find({ _id: { $in: tiffinIds } }).lean(),
  ]);

  const kitchenUsable = Boolean(kitchen && kitchen.status === "APPROVED");
  const foodMap = new Map(foods.map((f) => [toId(f._id), f]));
  const tiffinMap = new Map(tiffins.map((t) => [toId(t._id), t]));

  const lines: CartLineDTO[] = [];
  for (const item of cart.items) {
    const id = toId(item.itemId);
    if (item.itemType === "FOOD") {
      const food = foodMap.get(id);
      if (!food) continue;
      const category = food.category as unknown as { emoji?: string } | null;
      lines.push({
        itemType: "FOOD",
        itemId: id,
        name: food.name,
        unitPrice: food.price,
        quantity: item.quantity,
        subtotal: food.price * item.quantity,
        isAvailable: food.isAvailable && kitchenUsable,
        emoji: category?.emoji ?? DEFAULT_FOOD_EMOJI,
        image: food.image ?? "",
      });
    } else {
      const tiffin = tiffinMap.get(id);
      if (!tiffin) continue;
      lines.push({
        itemType: "TIFFIN",
        itemId: id,
        name: tiffin.name,
        unitPrice: tiffin.price,
        quantity: item.quantity,
        subtotal: tiffin.price * item.quantity,
        isAvailable: tiffin.isAvailable && kitchenUsable,
        emoji: "🍱",
        image: "",
      });
    }
  }

  const payable = lines.filter((line) => line.isAvailable);
  const totals = calculateTotals(payable);
  return {
    kitchenId: kitchen ? toId(kitchen._id) : null,
    kitchenName: kitchen?.kitchenName ?? null,
    kitchenOpen: Boolean(kitchen?.isOpen) && kitchenUsable,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    ...totals,
  };
}

export async function getCartCount(userId: string) {
  await connectDB();
  const cart = await Cart.findOne({ user: userId }).select("items").lean();
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}
