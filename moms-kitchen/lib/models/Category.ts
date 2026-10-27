import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    emoji: { type: String, default: "🍲" },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;

export const Category: Model<CategoryDoc> =
  models.Category || model<CategoryDoc>("Category", CategorySchema);
