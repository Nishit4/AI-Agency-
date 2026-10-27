import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const FoodSchema = new Schema(
  {
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type FoodDoc = InferSchemaType<typeof FoodSchema>;

export const Food: Model<FoodDoc> = models.Food || model<FoodDoc>("Food", FoodSchema);
