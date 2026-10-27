import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ITEM_TYPES, ORDER_STATUSES, PAYMENT_STATUSES } from "@/types";

/** Order items keep a snapshot of the name and price at purchase time. */
const OrderItemSchema = new Schema(
  {
    itemType: { type: String, enum: ITEM_TYPES, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    nameSnapshot: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: true },
);

const StatusEventSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    address: { type: Schema.Types.ObjectId, ref: "Address" },
    addressSnapshot: {
      label: { type: String, default: "" },
      addressLine: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      landmark: { type: String, default: "" },
    },
    contactPhone: { type: String, default: "" },
    notes: { type: String, default: "" },
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "PENDING" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "PENDING", index: true },
    statusHistory: { type: [StatusEventSchema], default: [] },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export const Order: Model<OrderDoc> = models.Order || model<OrderDoc>("Order", OrderSchema);
