import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ITEM_TYPES } from "@/types";

const CartItemSchema = new Schema(
  {
    itemType: { type: String, enum: ITEM_TYPES, required: true },
    // Food id or TiffinPlan id depending on itemType
    itemId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    // A cart holds items from a single kitchen (one order = one kitchen)
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", default: null },
    items: { type: [CartItemSchema], default: [] },
    // Recalculated on the server whenever the cart changes
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CartDoc = InferSchemaType<typeof CartSchema>;

export const Cart: Model<CartDoc> = models.Cart || model<CartDoc>("Cart", CartSchema);
