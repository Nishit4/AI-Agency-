import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { KITCHEN_STATUSES } from "@/types";

const KitchenSchema = new Schema(
  {
    // A provider owns exactly one kitchen
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    kitchenName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    address: {
      line: { type: String, default: "" },
      area: { type: String, default: "" },
      city: { type: String, default: "", index: true },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    // Pincodes / area names this kitchen delivers to
    serviceAreas: { type: [String], default: [] },
    image: { type: String, default: "" },
    phone: { type: String, default: "" },
    openingHours: { type: String, default: "" },
    isPureVeg: { type: Boolean, default: false },
    // Provider controlled availability (accepting orders right now)
    isOpen: { type: Boolean, default: true },
    // Only APPROVED kitchens are publicly visible
    status: { type: String, enum: KITCHEN_STATUSES, default: "PENDING", index: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type KitchenDoc = InferSchemaType<typeof KitchenSchema>;

export const Kitchen: Model<KitchenDoc> =
  models.Kitchen || model<KitchenDoc>("Kitchen", KitchenSchema);
