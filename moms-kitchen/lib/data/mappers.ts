/**
 * Convert lean Mongoose documents into plain, serialisable objects (DTOs)
 * that are safe to pass from Server Components to Client Components.
 */
import { iso, toId } from "@/lib/utils";
import type {
  AddressDTO,
  CategoryDTO,
  FoodDTO,
  KitchenDTO,
  KitchenStatus,
  OrderDTO,
  OrderStatus,
  PaymentStatus,
  ReviewDTO,
  Role,
  TiffinFrequency,
  TiffinPlanDTO,
  UserDTO,
} from "@/types";

// Lean documents are loosely typed here on purpose: populated fields may be
// either an ObjectId or the populated object.
type Lean = Record<string, any>;

function isPopulated(value: unknown): value is Lean {
  return typeof value === "object" && value !== null && "_id" in value && !("_bsontype" in value);
}

export function toCategoryDTO(doc: Lean): CategoryDTO {
  return {
    id: toId(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? "",
    emoji: doc.emoji ?? "🍲",
  };
}

export function toAddressDTO(doc: Lean): AddressDTO {
  return {
    id: toId(doc._id),
    label: doc.label ?? "",
    addressLine: doc.addressLine ?? "",
    city: doc.city ?? "",
    state: doc.state ?? "",
    pincode: doc.pincode ?? "",
    landmark: doc.landmark ?? "",
  };
}

export function toKitchenDTO(doc: Lean): KitchenDTO {
  return {
    id: toId(doc._id),
    ownerId: toId(doc.owner),
    ownerName: isPopulated(doc.owner) ? doc.owner.name : undefined,
    kitchenName: doc.kitchenName,
    description: doc.description ?? "",
    address: {
      line: doc.address?.line ?? "",
      area: doc.address?.area ?? "",
      city: doc.address?.city ?? "",
      state: doc.address?.state ?? "",
      pincode: doc.address?.pincode ?? "",
    },
    serviceAreas: doc.serviceAreas ?? [],
    image: doc.image ?? "",
    status: doc.status as KitchenStatus,
    isOpen: Boolean(doc.isOpen),
    isPureVeg: Boolean(doc.isPureVeg),
    openingHours: doc.openingHours ?? "",
    phone: doc.phone ?? "",
    rating: doc.rating ?? 0,
    ratingCount: doc.ratingCount ?? 0,
    createdAt: iso(doc.createdAt),
  };
}

export function toFoodDTO(doc: Lean): FoodDTO {
  return {
    id: toId(doc._id),
    kitchenId: toId(doc.kitchen),
    kitchenName: isPopulated(doc.kitchen) ? doc.kitchen.kitchenName : undefined,
    categoryId: toId(doc.category),
    category: isPopulated(doc.category) ? toCategoryDTO(doc.category) : undefined,
    name: doc.name,
    description: doc.description ?? "",
    price: doc.price,
    image: doc.image ?? "",
    isVeg: Boolean(doc.isVeg),
    isAvailable: Boolean(doc.isAvailable),
    createdAt: iso(doc.createdAt),
  };
}

export function toTiffinDTO(doc: Lean): TiffinPlanDTO {
  return {
    id: toId(doc._id),
    kitchenId: toId(doc.kitchen),
    kitchenName: isPopulated(doc.kitchen) ? doc.kitchen.kitchenName : undefined,
    name: doc.name,
    description: doc.description ?? "",
    frequency: doc.frequency as TiffinFrequency,
    price: doc.price,
    meals: doc.meals ?? "",
    isAvailable: Boolean(doc.isAvailable),
  };
}

export function toOrderDTO(doc: Lean): OrderDTO {
  const customer = isPopulated(doc.customer) ? doc.customer : null;
  const kitchen = isPopulated(doc.kitchen) ? doc.kitchen : null;
  return {
    id: toId(doc._id),
    orderNumber: doc.orderNumber,
    customerId: toId(doc.customer),
    customerName: customer?.name,
    customerPhone: customer?.phone,
    kitchenId: toId(doc.kitchen),
    kitchenName: kitchen?.kitchenName,
    kitchenPhone: kitchen?.phone,
    items: (doc.items ?? []).map((item: Lean) => ({
      itemType: item.itemType,
      itemId: toId(item.itemId),
      nameSnapshot: item.nameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    subtotal: doc.subtotal,
    deliveryFee: doc.deliveryFee ?? 0,
    totalAmount: doc.totalAmount,
    addressSnapshot: {
      label: doc.addressSnapshot?.label ?? "",
      addressLine: doc.addressSnapshot?.addressLine ?? "",
      city: doc.addressSnapshot?.city ?? "",
      state: doc.addressSnapshot?.state ?? "",
      pincode: doc.addressSnapshot?.pincode ?? "",
      landmark: doc.addressSnapshot?.landmark ?? "",
    },
    contactPhone: doc.contactPhone ?? "",
    notes: doc.notes ?? "",
    paymentMethod: doc.paymentMethod ?? "COD",
    paymentStatus: doc.paymentStatus as PaymentStatus,
    orderStatus: doc.orderStatus as OrderStatus,
    statusHistory: (doc.statusHistory ?? []).map((event: Lean) => ({
      status: event.status as OrderStatus,
      at: iso(event.at),
      note: event.note ?? "",
    })),
    cancelReason: doc.cancelReason ?? "",
    createdAt: iso(doc.createdAt),
  };
}

export function toReviewDTO(doc: Lean): ReviewDTO {
  return {
    id: toId(doc._id),
    customerId: toId(doc.customer),
    customerName: isPopulated(doc.customer) ? doc.customer.name : undefined,
    kitchenId: toId(doc.kitchen),
    kitchenName: isPopulated(doc.kitchen) ? doc.kitchen.kitchenName : undefined,
    foodId: doc.food ? toId(doc.food) : null,
    orderId: toId(doc.order),
    rating: doc.rating,
    comment: doc.comment ?? "",
    isHidden: Boolean(doc.isHidden),
    createdAt: iso(doc.createdAt),
  };
}

export function toUserDTO(doc: Lean): UserDTO {
  return {
    id: toId(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    role: doc.role as Role,
    profileImage: doc.profileImage ?? "",
    isActive: doc.isActive !== false,
    createdAt: iso(doc.createdAt),
  };
}
