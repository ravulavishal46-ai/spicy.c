export type SpiceLevel = 1 | 2 | 3 | 4 | 5;

export type DietTag = "veg" | "vegan" | "gluten-free" | "contains-nuts";
export type Badge = "bestseller" | "new" | "chef-pick" | "limited";
export type ComboRole = "main" | "side" | "drink";

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  comboRole: ComboRole | null;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface SizeOption {
  id: string;
  name: string;
  /** Added to the base price. */
  priceDelta: number;
}

export interface Dish {
  id: string;
  slug: string;
  name: string;
  category: string;
  short: string;
  story: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  /** House default heat. */
  spice: SpiceLevel;
  spiceAdjustable: boolean;
  diet: DietTag[];
  badges: Badge[];
  calories: number;
  prepMinutes: number;
  ingredients: string[];
  addOns: AddOn[];
  sizes: SizeOption[];
  /** Cuisine/flavour profile used by personalised discovery. */
  profile: string[];
}

export interface DishLine {
  key: string;
  kind: "dish";
  dishId: string;
  qty: number;
  spice: SpiceLevel;
  addOnIds: string[];
  sizeId: string | null;
  note: string;
}

export interface ComboLine {
  key: string;
  kind: "combo";
  qty: number;
  picks: { dishId: string; spice: SpiceLevel }[];
  discountPct: number;
}

export type CartLine = DishLine | ComboLine;

export type CouponKind = "percent" | "flat" | "free-delivery";

export interface Coupon {
  code: string;
  title: string;
  description: string;
  kind: CouponKind;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  expires: string;
  active: boolean;
  uses: number;
}

export type OrderStatus =
  | "placed"
  | "preparing"
  | "packed"
  | "on-the-way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  dishId: string;
  name: string;
  qty: number;
  unitPrice: number;
  spice: SpiceLevel;
  detail: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export type PaymentMethod = "card" | "upi" | "cod";

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  status: OrderStatus;
  address: string;
  payment: PaymentMethod;
  couponCode: string | null;
  /** When true, tracking animates through stages based on time since createdAt. */
  live: boolean;
  rated?: number;
}

export interface Review {
  id: string;
  dishId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: "published" | "pending" | "hidden";
  reply?: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  heatPreference: SpiceLevel;
}
