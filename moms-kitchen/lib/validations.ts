import { z } from "zod";
import { TIFFIN_FREQUENCIES } from "@/types";

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "Enter a valid image URL")
  .default("");

const pincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

/** Checkbox inputs submit "on" when ticked and nothing when not. */
const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().trim().email("Enter a valid email").max(120),
    phone,
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "PROVIDER"], { message: "Choose an account type" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  phone,
  profileImage: optionalUrl,
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(30),
  addressLine: z.string().trim().min(5, "Enter your full address").max(200),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().trim().max(60).default(""),
  pincode,
  landmark: z.string().trim().max(100).default(""),
});

export const kitchenSchema = z.object({
  kitchenName: z.string().trim().min(3, "Kitchen name must be at least 3 characters").max(80),
  description: z.string().trim().min(10, "Tell customers a little more (10+ characters)").max(600),
  phone,
  line: z.string().trim().min(3, "Address is required").max(150),
  area: z.string().trim().min(2, "Area is required").max(60),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().trim().min(2, "State is required").max(60),
  pincode,
  serviceAreas: z
    .string()
    .trim()
    .max(400)
    .transform((value) =>
      Array.from(
        new Set(
          value
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean),
        ),
      ).slice(0, 20),
    ),
  openingHours: z.string().trim().max(60).default(""),
  image: optionalUrl,
  isPureVeg: checkbox,
});

export const foodSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  description: z.string().trim().max(400).default(""),
  categoryId: z.string().trim().min(1, "Choose a category"),
  price: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .int("Price must be a whole number")
    .min(1, "Price must be at least ₹1")
    .max(10000, "Price looks too high"),
  image: optionalUrl,
  isVeg: checkbox,
  isAvailable: checkbox,
});

export const tiffinSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  description: z.string().trim().max(400).default(""),
  frequency: z.enum(TIFFIN_FREQUENCIES),
  price: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .int("Price must be a whole number")
    .min(1, "Price must be at least ₹1")
    .max(50000, "Price looks too high"),
  meals: z.string().trim().min(3, "Describe what is included").max(200),
  isAvailable: checkbox,
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(500).default(""),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(40),
  description: z.string().trim().max(200).default(""),
  emoji: z.string().trim().min(1, "Pick an emoji").max(8),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Choose a delivery address"),
  notes: z.string().trim().max(300).default(""),
  paymentMethod: z.literal("COD", { errorMap: () => ({ message: "Choose a payment method" }) }),
});

/** Turn FormData into a plain object for zod. */
export function formToObject(formData: FormData) {
  const object: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") object[key] = value;
  });
  return object;
}
