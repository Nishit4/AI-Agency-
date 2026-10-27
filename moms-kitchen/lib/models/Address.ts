import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AddressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Home", trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type AddressDoc = InferSchemaType<typeof AddressSchema>;

export const Address: Model<AddressDoc> =
  models.Address || model<AddressDoc>("Address", AddressSchema);
