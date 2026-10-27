import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    food: { type: Schema.Types.ObjectId, ref: "Food", default: null },
    // One review per delivered order
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
    // Admin moderation
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;

export const Review: Model<ReviewDoc> = models.Review || model<ReviewDoc>("Review", ReviewSchema);
