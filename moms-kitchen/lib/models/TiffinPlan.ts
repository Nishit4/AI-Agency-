import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { TIFFIN_FREQUENCIES } from "@/types";

const TiffinPlanSchema = new Schema(
  {
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    frequency: { type: String, enum: TIFFIN_FREQUENCIES, default: "DAILY" },
    price: { type: Number, required: true, min: 1 },
    // What is included, e.g. "4 roti, dal, sabzi, rice, salad"
    meals: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type TiffinPlanDoc = InferSchemaType<typeof TiffinPlanSchema>;

export const TiffinPlan: Model<TiffinPlanDoc> =
  models.TiffinPlan || model<TiffinPlanDoc>("TiffinPlan", TiffinPlanSchema);
