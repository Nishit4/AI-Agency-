import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/types";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    // bcrypt hash — plaintext passwords are never stored
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "CUSTOMER" },
    profileImage: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> = models.User || model<UserDoc>("User", UserSchema);
