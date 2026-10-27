export const ROLES = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const KITCHEN_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type KitchenStatus = (typeof KITCHEN_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TIFFIN_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type TiffinFrequency = (typeof TIFFIN_FREQUENCIES)[number];

export const ITEM_TYPES = ["FOOD", "TIFFIN"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/** Result returned by server actions used with useActionState. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Values the user submitted, returned on validation errors. */
  values?: Record<string, string>;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profileImage?: string;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
};

export type AddressDTO = {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
};

export type KitchenDTO = {
  id: string;
  ownerId: string;
  ownerName?: string;
  kitchenName: string;
  description: string;
  address: {
    line: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  serviceAreas: string[];
  image: string;
  status: KitchenStatus;
  isOpen: boolean;
  isPureVeg: boolean;
  openingHours: string;
  phone: string;
  rating: number;
  ratingCount: number;
  categories?: CategoryDTO[];
  createdAt: string;
};

export type FoodDTO = {
  id: string;
  kitchenId: string;
  kitchenName?: string;
  categoryId: string;
  category?: CategoryDTO;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt: string;
};

export type TiffinPlanDTO = {
  id: string;
  kitchenId: string;
  kitchenName?: string;
  name: string;
  description: string;
  frequency: TiffinFrequency;
  price: number;
  meals: string;
  isAvailable: boolean;
};

export type CartLineDTO = {
  itemType: ItemType;
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
  emoji: string;
  image: string;
};

export type CartDTO = {
  kitchenId: string | null;
  kitchenName: string | null;
  kitchenOpen: boolean;
  lines: CartLineDTO[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
};

export type OrderItemDTO = {
  itemType: ItemType;
  itemId: string;
  nameSnapshot: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderDTO = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  kitchenId: string;
  kitchenName?: string;
  kitchenPhone?: string;
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  addressSnapshot: Omit<AddressDTO, "id">;
  contactPhone: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
  cancelReason: string;
  hasReview?: boolean;
  createdAt: string;
};

export type ReviewDTO = {
  id: string;
  customerId: string;
  customerName?: string;
  kitchenId: string;
  kitchenName?: string;
  foodId: string | null;
  orderId: string;
  rating: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  profileImage: string;
  isActive: boolean;
  createdAt: string;
};
