"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MAX_ITEM_QUANTITY } from "@/lib/constants";
import { getCart } from "@/lib/data/cart";
import { connectDB } from "@/lib/db";
import { Cart, Food, Kitchen, TiffinPlan } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { toId } from "@/lib/utils";
import { ITEM_TYPES, type ItemType } from "@/types";

export type CartActionResult = {
  ok: boolean;
  message: string;
  requiresLogin?: boolean;
  needsReplace?: boolean;
  cartCount?: number;
};

const addSchema = z.object({
  itemType: z.enum(ITEM_TYPES),
  itemId: z.string().refine(isValidObjectId, "Invalid item"),
  quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
  replace: z.boolean().optional(),
});

async function loadItem(itemType: ItemType, itemId: string) {
  if (itemType === "FOOD") {
    const food = await Food.findById(itemId).lean();
    return food ? { kitchen: food.kitchen, isAvailable: food.isAvailable, name: food.name } : null;
  }
  const tiffin = await TiffinPlan.findById(itemId).lean();
  return tiffin ? { kitchen: tiffin.kitchen, isAvailable: tiffin.isAvailable, name: tiffin.name } : null;
}

async function saveTotals(userId: string) {
  const cart = await getCart(userId);
  await Cart.updateOne({ user: userId }, { totalAmount: cart.totalAmount });
  return cart.itemCount;
}

export async function addToCart(input: {
  itemType: ItemType;
  itemId: string;
  quantity?: number;
  replace?: boolean;
}): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresLogin: true, message: "Please log in to add items to your cart." };
  if (user.role !== "CUSTOMER") {
    return { ok: false, message: "Only customer accounts can place orders." };
  }

  const parsed = addSchema.safeParse({ quantity: 1, ...input });
  if (!parsed.success) return { ok: false, message: "Invalid item." };
  const { itemType, itemId, quantity, replace } = parsed.data;

  await connectDB();
  const item = await loadItem(itemType, itemId);
  if (!item) return { ok: false, message: "This item no longer exists." };
  if (!item.isAvailable) return { ok: false, message: `${item.name} is currently unavailable.` };

  const kitchen = await Kitchen.findById(item.kitchen).lean();
  if (!kitchen || kitchen.status !== "APPROVED") {
    return { ok: false, message: "This kitchen is not available." };
  }
  if (!kitchen.isOpen) {
    return { ok: false, message: `${kitchen.kitchenName} is not accepting orders right now.` };
  }

  let cart = await Cart.findOne({ user: user.id });
  if (!cart) cart = new Cart({ user: user.id, items: [] });

  const sameKitchen = !cart.kitchen || toId(cart.kitchen) === toId(kitchen._id) || cart.items.length === 0;
  if (!sameKitchen) {
    if (!replace) {
      return {
        ok: false,
        needsReplace: true,
        message: "Your cart has items from another kitchen. Replace them with this item?",
      };
    }
    cart.items.splice(0, cart.items.length);
  }

  cart.kitchen = kitchen._id;
  const existing = cart.items.find(
    (line) => line.itemType === itemType && toId(line.itemId) === itemId,
  );
  if (existing) {
    existing.quantity = Math.min(MAX_ITEM_QUANTITY, existing.quantity + quantity);
  } else {
    cart.items.push({ itemType, itemId, quantity });
  }
  await cart.save();
  const cartCount = await saveTotals(user.id);

  revalidatePath("/", "layout");
  return { ok: true, message: `${item.name} added to cart.`, cartCount };
}

export async function updateCartQuantity(input: {
  itemType: ItemType;
  itemId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return { ok: false, requiresLogin: !user, message: "Please log in." };

  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > MAX_ITEM_QUANTITY) {
    return { ok: false, message: `Quantity must be between 0 and ${MAX_ITEM_QUANTITY}.` };
  }

  await connectDB();
  const cart = await Cart.findOne({ user: user.id });
  if (!cart) return { ok: false, message: "Your cart is empty." };

  const index = cart.items.findIndex(
    (line) => line.itemType === input.itemType && toId(line.itemId) === input.itemId,
  );
  if (index === -1) return { ok: false, message: "Item not found in cart." };

  if (quantity === 0) cart.items.splice(index, 1);
  else cart.items[index].quantity = quantity;
  if (cart.items.length === 0) cart.kitchen = null;
  await cart.save();
  const cartCount = await saveTotals(user.id);

  revalidatePath("/", "layout");
  return { ok: true, message: quantity === 0 ? "Item removed." : "Cart updated.", cartCount };
}

export async function clearCart(): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return { ok: false, message: "Please log in." };
  await connectDB();
  await Cart.updateOne({ user: user.id }, { items: [], kitchen: null, totalAmount: 0 });
  revalidatePath("/", "layout");
  return { ok: true, message: "Cart cleared.", cartCount: 0 };
}
