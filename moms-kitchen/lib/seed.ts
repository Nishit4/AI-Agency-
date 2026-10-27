/**
 * Sample data for development (based on section 27 of the project report).
 * Inserted automatically on first run when the database is empty, or manually
 * with `npm run seed` (which resets the database).
 */
import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import {
  Address,
  Cart,
  Category,
  Food,
  Kitchen,
  Order,
  Review,
  TiffinPlan,
  User,
} from "@/lib/models";
import { calculateTotals, generateOrderNumber } from "@/lib/order-rules";
import { recalculateKitchenRating } from "@/lib/ratings";
import type { ItemType, OrderStatus } from "@/types";

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@momskitchen.com", password: "admin123" },
  customer: { email: "customer@momskitchen.com", password: "customer123" },
  provider: { email: "meena@momskitchen.com", password: "provider123" },
};

const CATEGORIES = [
  { name: "Gujarati", emoji: "🫓", description: "Thepla, dhokla, kadhi and full Gujarati meals" },
  { name: "Punjabi", emoji: "🍛", description: "Rajma, chole, parathas and rich curries" },
  { name: "South Indian", emoji: "🥞", description: "Idli, dosa, sambar and rice specials" },
  { name: "Healthy", emoji: "🥗", description: "Light, balanced and nutritious home meals" },
  { name: "Thali", emoji: "🍱", description: "Complete meals with roti, dal, sabzi and rice" },
  { name: "Snacks", emoji: "🥟", description: "Tea-time farsan and evening snacks" },
  { name: "Sweets", emoji: "🍮", description: "Homemade mithai and desserts" },
];

type SeedFood = {
  name: string;
  category: string;
  price: number;
  description: string;
  isVeg?: boolean;
  isAvailable?: boolean;
};

type SeedTiffin = {
  name: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  price: number;
  meals: string;
  description: string;
};

type SeedKitchen = {
  owner: { name: string; email: string; phone: string };
  kitchenName: string;
  description: string;
  address: { line: string; area: string; city: string; state: string; pincode: string };
  serviceAreas: string[];
  openingHours: string;
  isPureVeg: boolean;
  status: "APPROVED" | "PENDING";
  foods: SeedFood[];
  tiffins: SeedTiffin[];
};

const KITCHENS: SeedKitchen[] = [
  {
    owner: { name: "Meena Patel", email: "meena@momskitchen.com", phone: "9876500001" },
    kitchenName: "Mom's Gujarati Kitchen",
    description:
      "Authentic Gujarati home cooking made fresh every morning — sweet-and-tangy dal, soft rotlis and seasonal shaak, just like home.",
    address: {
      line: "12, Shanti Kunj Society",
      area: "Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
    },
    serviceAreas: ["380009", "380006", "380013", "Navrangpura", "Naranpura"],
    openingHours: "8:00 AM – 9:00 PM",
    isPureVeg: true,
    status: "APPROVED",
    foods: [
      {
        name: "Gujarati Lunch Tiffin",
        category: "Gujarati",
        price: 90,
        description: "4 rotli, Gujarati dal, seasonal shaak, rice, salad and chaas.",
      },
      {
        name: "Khaman Dhokla (250g)",
        category: "Snacks",
        price: 60,
        description: "Soft, spongy besan dhokla with green chutney and fried chillies.",
      },
      {
        name: "Methi Thepla with Chhundo",
        category: "Gujarati",
        price: 70,
        description: "5 methi theplas served with homemade sweet mango chhundo and curd.",
      },
      {
        name: "Kadhi Khichdi",
        category: "Gujarati",
        price: 85,
        description: "Comforting moong dal khichdi with sweet-sour Gujarati kadhi and papad.",
      },
      {
        name: "Undhiyu (Seasonal)",
        category: "Gujarati",
        price: 140,
        description: "Slow-cooked winter vegetables with methi muthiya. Available on weekends.",
        isAvailable: false,
      },
    ],
    tiffins: [
      {
        name: "Daily Gujarati Tiffin",
        frequency: "DAILY",
        price: 90,
        meals: "Lunch: 4 rotli, dal, shaak, rice, salad",
        description: "One fresh Gujarati lunch delivered today.",
      },
      {
        name: "Weekly Gujarati Tiffin",
        frequency: "WEEKLY",
        price: 580,
        meals: "7 lunches: rotli, dal, shaak, rice, salad",
        description: "A full week of home-style lunches. Menu changes daily.",
      },
      {
        name: "Monthly Gujarati Tiffin",
        frequency: "MONTHLY",
        price: 2200,
        meals: "26 lunches (Mon–Sat): rotli, dal, shaak, rice, salad",
        description: "Best value for students and working professionals.",
      },
    ],
  },
  {
    owner: { name: "Harpreet Kaur", email: "harpreet@momskitchen.com", phone: "9876500002" },
    kitchenName: "Home Taste Kitchen",
    description:
      "Hearty Punjabi ghar ka khana — slow-cooked rajma, chole and buttery parathas made with love and pure desi ghee.",
    address: {
      line: "B-204, Shivalik Residency",
      area: "Satellite",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
    },
    serviceAreas: ["380015", "380054", "380051", "Satellite", "Prahladnagar"],
    openingHours: "11:00 AM – 10:00 PM",
    isPureVeg: false,
    status: "APPROVED",
    foods: [
      {
        name: "Rajma Rice",
        category: "Punjabi",
        price: 120,
        description: "Creamy Punjabi rajma with jeera rice, onion salad and pickle.",
      },
      {
        name: "Chole Bhature",
        category: "Punjabi",
        price: 110,
        description: "Spicy Amritsari chole with two fluffy bhature.",
      },
      {
        name: "Aloo Paratha with Curd",
        category: "Punjabi",
        price: 80,
        description: "Two stuffed aloo parathas with white butter, curd and achar.",
      },
      {
        name: "Paneer Butter Masala Thali",
        category: "Thali",
        price: 160,
        description: "Paneer butter masala, dal makhani, 3 roti, rice and salad.",
      },
      {
        name: "Homestyle Egg Curry",
        category: "Punjabi",
        price: 130,
        description: "Two boiled eggs in onion-tomato gravy with 3 roti.",
        isVeg: false,
      },
    ],
    tiffins: [
      {
        name: "Punjabi Lunch Box",
        frequency: "DAILY",
        price: 130,
        meals: "Lunch: dal/rajma, sabzi, 4 roti, rice",
        description: "A filling Punjabi lunch delivered hot.",
      },
      {
        name: "Monthly Punjabi Tiffin",
        frequency: "MONTHLY",
        price: 3200,
        meals: "26 lunches: dal/rajma, sabzi, 4 roti, rice",
        description: "Monthly lunch subscription — Monday to Saturday.",
      },
    ],
  },
  {
    owner: { name: "Asha Desai", email: "asha@momskitchen.com", phone: "9876500003" },
    kitchenName: "Asha Home Food",
    description:
      "Light, nutritious and low-oil home meals — millets, sprouts and simple dal-khichdi for everyday wellness.",
    address: {
      line: "7, Tulsi Bungalows",
      area: "Bopal",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380058",
    },
    serviceAreas: ["380058", "380059", "Bopal", "South Bopal", "Ghuma"],
    openingHours: "7:30 AM – 8:30 PM",
    isPureVeg: true,
    status: "APPROVED",
    foods: [
      {
        name: "Dal Khichdi",
        category: "Healthy",
        price: 80,
        description: "Moong dal khichdi with ghee tadka, curd and roasted papad.",
      },
      {
        name: "Sprouts Chaat Bowl",
        category: "Healthy",
        price: 70,
        description: "Protein-rich mixed sprouts with veggies, lemon and chaat masala.",
      },
      {
        name: "Millet Roti Meal",
        category: "Healthy",
        price: 110,
        description: "Bajra/jowar rotla, lauki sabzi, dal and salad. Low oil.",
      },
      {
        name: "Vegetable Oats Upma",
        category: "Healthy",
        price: 60,
        description: "Wholesome oats upma loaded with vegetables. Great for breakfast.",
      },
    ],
    tiffins: [
      {
        name: "Healthy Weekly Plan",
        frequency: "WEEKLY",
        price: 600,
        meals: "7 lunches: millet roti / khichdi, sabzi, dal, salad",
        description: "Balanced, low-oil meals planned by a home nutrition enthusiast.",
      },
    ],
  },
  {
    owner: { name: "Lakshmi Iyer", email: "lakshmi@momskitchen.com", phone: "9876500004" },
    kitchenName: "South Home Meals",
    description:
      "Traditional Tamil home cooking — fluffy idlis, crisp dosas and flavourful sambar made from freshly ground batter.",
    address: {
      line: "21, Nandanvan Flats",
      area: "Maninagar",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380008",
    },
    serviceAreas: ["380008", "380028", "Maninagar", "Isanpur"],
    openingHours: "7:00 AM – 9:30 PM",
    isPureVeg: true,
    status: "APPROVED",
    foods: [
      {
        name: "Idli & Sambar",
        category: "South Indian",
        price: 70,
        description: "4 soft idlis with sambar, coconut chutney and tomato chutney.",
      },
      {
        name: "Masala Dosa",
        category: "South Indian",
        price: 90,
        description: "Crisp dosa with potato masala, sambar and chutneys.",
      },
      {
        name: "Lemon Rice",
        category: "South Indian",
        price: 75,
        description: "Tangy lemon rice with peanuts, curry leaves and papad.",
      },
      {
        name: "Curd Rice",
        category: "South Indian",
        price: 65,
        description: "Cooling curd rice tempered with mustard, ginger and pomegranate.",
      },
      {
        name: "Medu Vada (4 pcs)",
        category: "Snacks",
        price: 60,
        description: "Crispy urad dal vadas with sambar and chutney.",
      },
    ],
    tiffins: [
      {
        name: "South Indian Daily Meal",
        frequency: "DAILY",
        price: 100,
        meals: "Lunch: rice, sambar, rasam, poriyal, curd",
        description: "A complete Tamil-style lunch.",
      },
    ],
  },
  {
    owner: { name: "Rekha Shah", email: "rekha@momskitchen.com", phone: "9876500005" },
    kitchenName: "Sweet Memories Kitchen",
    description:
      "Festive homemade sweets and farsan prepared in small batches with pure ghee — perfect for celebrations.",
    address: {
      line: "3, Sarita Society, Race Course Road",
      area: "Alkapuri",
      city: "Vadodara",
      state: "Gujarat",
      pincode: "390007",
    },
    serviceAreas: ["390007", "390005", "Alkapuri", "Sayajigunj"],
    openingHours: "10:00 AM – 8:00 PM",
    isPureVeg: true,
    status: "APPROVED",
    foods: [
      {
        name: "Kesar Shrikhand (500g)",
        category: "Sweets",
        price: 120,
        description: "Thick hung-curd shrikhand with saffron, cardamom and pistachios.",
      },
      {
        name: "Gulab Jamun (6 pcs)",
        category: "Sweets",
        price: 80,
        description: "Soft khoya gulab jamun soaked in rose-cardamom syrup.",
      },
      {
        name: "Mohanthal (250g)",
        category: "Sweets",
        price: 150,
        description: "Traditional Gujarati besan fudge with ghee and dry fruits.",
      },
      {
        name: "Khandvi",
        category: "Snacks",
        price: 70,
        description: "Silky gram-flour rolls tempered with mustard, sesame and coconut.",
      },
    ],
    tiffins: [],
  },
  {
    owner: { name: "Sunita Joshi", email: "sunita@momskitchen.com", phone: "9876500006" },
    kitchenName: "Annapurna Tiffin Service",
    description: "Maharashtrian-style home tiffins for students and office-goers.",
    address: {
      line: "45, Sai Darshan Apartments",
      area: "Fatehgunj",
      city: "Vadodara",
      state: "Gujarat",
      pincode: "390002",
    },
    serviceAreas: ["390002", "Fatehgunj"],
    openingHours: "9:00 AM – 9:00 PM",
    isPureVeg: true,
    status: "PENDING",
    foods: [
      {
        name: "Poha",
        category: "Snacks",
        price: 40,
        description: "Kanda poha with sev, peanuts and lemon.",
      },
      {
        name: "Maharashtrian Thali",
        category: "Thali",
        price: 120,
        description: "Bhakri, pithla, sabzi, varan bhaat and thecha.",
      },
    ],
    tiffins: [
      {
        name: "Student Monthly Tiffin",
        frequency: "MONTHLY",
        price: 2000,
        meals: "26 dinners: 3 chapati, sabzi, dal, rice",
        description: "Affordable monthly dinner plan.",
      },
    ],
  },
];

type SeedOrderLine = { kitchen: string; item: string; quantity: number; type?: ItemType };

type SeedOrder = {
  customer: "priya" | "rahul";
  kitchen: string;
  lines: Omit<SeedOrderLine, "kitchen">[];
  status: OrderStatus;
  daysAgo: number;
  review?: { rating: number; comment: string };
};

const ORDERS: SeedOrder[] = [
  {
    customer: "priya",
    kitchen: "Mom's Gujarati Kitchen",
    lines: [
      { item: "Gujarati Lunch Tiffin", quantity: 2 },
      { item: "Khaman Dhokla (250g)", quantity: 1 },
    ],
    status: "DELIVERED",
    daysAgo: 5,
    review: { rating: 5, comment: "Tastes exactly like my mom's cooking. The dal was perfect!" },
  },
  {
    customer: "priya",
    kitchen: "South Home Meals",
    lines: [
      { item: "Masala Dosa", quantity: 2 },
      { item: "Medu Vada (4 pcs)", quantity: 1 },
    ],
    status: "DELIVERED",
    daysAgo: 3,
    review: { rating: 4, comment: "Crispy dosa and lovely sambar. Delivery was a bit late." },
  },
  {
    customer: "priya",
    kitchen: "Asha Home Food",
    lines: [
      { item: "Dal Khichdi", quantity: 1 },
      { item: "Sprouts Chaat Bowl", quantity: 1 },
    ],
    status: "DELIVERED",
    daysAgo: 1,
  },
  {
    customer: "priya",
    kitchen: "Home Taste Kitchen",
    lines: [
      { item: "Rajma Rice", quantity: 1 },
      { item: "Aloo Paratha with Curd", quantity: 1 },
    ],
    status: "PREPARING",
    daysAgo: 0,
  },
  {
    customer: "rahul",
    kitchen: "Home Taste Kitchen",
    lines: [{ item: "Chole Bhature", quantity: 2 }],
    status: "DELIVERED",
    daysAgo: 2,
    review: { rating: 5, comment: "Best chole bhature in Satellite. Generous portions." },
  },
  {
    customer: "rahul",
    kitchen: "Mom's Gujarati Kitchen",
    lines: [{ item: "Daily Gujarati Tiffin", quantity: 1, type: "TIFFIN" }],
    status: "DELIVERED",
    daysAgo: 6,
    review: { rating: 4, comment: "Simple, fresh and filling. Will subscribe monthly." },
  },
  {
    customer: "rahul",
    kitchen: "Asha Home Food",
    lines: [{ item: "Millet Roti Meal", quantity: 1 }],
    status: "DELIVERED",
    daysAgo: 4,
    review: { rating: 5, comment: "Healthy and still super tasty. Loved the bajra rotla." },
  },
  {
    customer: "rahul",
    kitchen: "Sweet Memories Kitchen",
    lines: [
      { item: "Kesar Shrikhand (500g)", quantity: 1 },
      { item: "Khandvi", quantity: 1 },
    ],
    status: "DELIVERED",
    daysAgo: 8,
    review: { rating: 5, comment: "Shrikhand was rich and creamy. Perfect for our family dinner." },
  },
  {
    customer: "rahul",
    kitchen: "Mom's Gujarati Kitchen",
    lines: [
      { item: "Methi Thepla with Chhundo", quantity: 2 },
      { item: "Kadhi Khichdi", quantity: 1 },
    ],
    status: "PENDING",
    daysAgo: 0,
  },
];

const HAPPY_PATH: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function historyUntil(status: OrderStatus, start: Date) {
  const steps = HAPPY_PATH.slice(0, HAPPY_PATH.indexOf(status) + 1);
  return steps.map((step, index) => ({
    status: step,
    at: new Date(start.getTime() + index * 12 * 60 * 1000),
    note: "",
  }));
}

/** Insert sample data only when the database has no users yet. */
export async function seedIfEmpty() {
  const users = await User.estimatedDocumentCount();
  if (users > 0) return false;
  await seedDatabase();
  return true;
}

export async function seedDatabase({ reset = false }: { reset?: boolean } = {}) {
  if (reset) {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Kitchen.deleteMany({}),
      Food.deleteMany({}),
      TiffinPlan.deleteMany({}),
      Address.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
  }

  const [adminHash, customerHash, providerHash] = await Promise.all([
    bcrypt.hash(DEMO_ACCOUNTS.admin.password, 10),
    bcrypt.hash(DEMO_ACCOUNTS.customer.password, 10),
    bcrypt.hash(DEMO_ACCOUNTS.provider.password, 10),
  ]);

  // Categories
  const categoryDocs = await Category.insertMany(
    CATEGORIES.map((category) => ({
      ...category,
      slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    })),
  );
  const categoryByName = new Map(categoryDocs.map((doc) => [doc.name, doc._id]));

  // Users
  await User.create({
    name: "Platform Admin",
    email: DEMO_ACCOUNTS.admin.email,
    phone: "9876500000",
    passwordHash: adminHash,
    role: "ADMIN",
  });
  const priya = await User.create({
    name: "Priya Sharma",
    email: DEMO_ACCOUNTS.customer.email,
    phone: "9876511111",
    passwordHash: customerHash,
    role: "CUSTOMER",
  });
  const rahul = await User.create({
    name: "Rahul Mehta",
    email: "rahul@momskitchen.com",
    phone: "9876522222",
    passwordHash: customerHash,
    role: "CUSTOMER",
  });

  const priyaAddress = await Address.create({
    user: priya._id,
    label: "Home",
    addressLine: "A-302, Sunrise Apartments, C.G. Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380009",
    landmark: "Near Municipal Market",
  });
  await Address.create({
    user: priya._id,
    label: "Work",
    addressLine: "5th Floor, Venus Atlantis, Prahladnagar",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    landmark: "Opp. Corporate Road",
  });
  const rahulAddress = await Address.create({
    user: rahul._id,
    label: "Home",
    addressLine: "14, Gulmohar Park, Satellite Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    landmark: "Near Jodhpur Cross Road",
  });

  // Kitchens with their menus and tiffin plans
  const kitchenIdByName = new Map<string, Types.ObjectId>();
  const itemsByKitchen = new Map<
    string,
    Map<string, { id: Types.ObjectId; price: number; type: ItemType }>
  >();

  for (const seed of KITCHENS) {
    const owner = await User.create({
      ...seed.owner,
      passwordHash: providerHash,
      role: "PROVIDER",
    });
    const kitchen = await Kitchen.create({
      owner: owner._id,
      kitchenName: seed.kitchenName,
      description: seed.description,
      address: seed.address,
      serviceAreas: seed.serviceAreas,
      phone: seed.owner.phone,
      openingHours: seed.openingHours,
      isPureVeg: seed.isPureVeg,
      status: seed.status,
      isOpen: true,
    });
    kitchenIdByName.set(seed.kitchenName, kitchen._id);

    const items = new Map<string, { id: Types.ObjectId; price: number; type: ItemType }>();
    for (const food of seed.foods) {
      const doc = await Food.create({
        kitchen: kitchen._id,
        category: categoryByName.get(food.category),
        name: food.name,
        description: food.description,
        price: food.price,
        isVeg: food.isVeg ?? true,
        isAvailable: food.isAvailable ?? true,
      });
      items.set(food.name, { id: doc._id, price: food.price, type: "FOOD" });
    }
    for (const tiffin of seed.tiffins) {
      const doc = await TiffinPlan.create({ kitchen: kitchen._id, ...tiffin });
      items.set(tiffin.name, { id: doc._id, price: tiffin.price, type: "TIFFIN" });
    }
    itemsByKitchen.set(seed.kitchenName, items);
  }

  // Orders (+ reviews for some delivered orders)
  const customers = {
    priya: { user: priya, address: priyaAddress },
    rahul: { user: rahul, address: rahulAddress },
  };

  for (const seed of ORDERS) {
    const { user, address } = customers[seed.customer];
    const kitchenItems = itemsByKitchen.get(seed.kitchen)!;
    const items = seed.lines.map((line) => {
      const item = kitchenItems.get(line.item)!;
      return {
        itemType: item.type,
        itemId: item.id,
        nameSnapshot: line.item,
        quantity: line.quantity,
        unitPrice: item.price,
        subtotal: item.price * line.quantity,
      };
    });
    const totals = calculateTotals(items);
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000 - 90 * 60 * 1000);

    const order = await Order.create({
      orderNumber: generateOrderNumber(createdAt),
      customer: user._id,
      kitchen: kitchenIdByName.get(seed.kitchen),
      items,
      ...totals,
      address: address._id,
      addressSnapshot: {
        label: address.label,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
      },
      contactPhone: user.phone,
      notes: "",
      paymentMethod: "COD",
      paymentStatus: seed.status === "DELIVERED" ? "PAID" : "PENDING",
      orderStatus: seed.status,
      statusHistory: historyUntil(seed.status, createdAt),
      createdAt,
      updatedAt: createdAt,
    });

    if (seed.review) {
      await Review.create({
        customer: user._id,
        kitchen: kitchenIdByName.get(seed.kitchen),
        food: items[0].itemType === "FOOD" ? items[0].itemId : null,
        order: order._id,
        rating: seed.review.rating,
        comment: seed.review.comment,
        createdAt: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
      });
    }
  }

  // Store average rating on each kitchen
  for (const kitchenId of kitchenIdByName.values()) {
    await recalculateKitchenRating(kitchenId);
  }
}
