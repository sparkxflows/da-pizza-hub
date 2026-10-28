export type PizzaSize = "regular" | "medium" | "large";

export type MenuCategory =
  | "royal-special"
  | "veg-special"
  | "veg-feast"
  | "veg-delight"
  | "veg-treat"
  | "simply-veg"
  | "burger"
  | "fries"
  | "pasta"
  | "wrap"
  | "bread"
  | "sides-other"
  | "shake"
  | "mocktail"
  | "dessert";

export type PaymentMethod = "cod" | "upi";

export type ScheduleMode = "now" | "scheduled";

export interface PizzaSizePrices {
  regular: number;
  medium: number;
  large: number;
}

export interface BaseMenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  image: string;
  isBestSeller: boolean;
  isNew: boolean;
  isAvailable?: boolean;
}

export interface PizzaMenuItem extends BaseMenuItem {
  type: "pizza";
  prices: PizzaSizePrices;
}

export interface SimpleMenuItem extends BaseMenuItem {
  type: "simple";
  price: number;
}

export type MenuItem = PizzaMenuItem | SimpleMenuItem;

export interface PizzaCustomization {
  size: PizzaSize;
  extraCheese: boolean;
  cheeseBurst: boolean;
  panBase: boolean;
  extraToppings: string[];
}

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  image?: string;
  basePrice: number;
  quantity: number;
  unitPrice: number;
  customization?: PizzaCustomization;
  customizationSummary?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  description: string;
}

export interface Coupon {
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  swiggyUrl?: string;
  zomatoUrl?: string;
  lat: number;
  lng: number;
}

export interface DbBranchRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  maps_url: string;
  swiggy_url?: string;
  zomato_url?: string;
  lat: number;
  lng: number;
  is_active: boolean;
}

export interface DbMenuRow {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  item_type: "pizza" | "simple";
  price?: number;
  price_regular?: number;
  price_medium?: number;
  price_large?: number;
  image: string;
  is_best_seller: boolean;
  is_new: boolean;
  is_available: boolean;
}

export interface DbCouponRow {
  code: string;
  type: "flat" | "percent";
  value: number;
  min_order: number;
  max_discount?: number;
  description: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | "new"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderRecord {
  id: string;
  orderNumber: string;
  idempotencyKey?: string;
  branchId: string;
  orderType: "delivery" | "pickup";
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerLat: number | null;
  customerLng: number | null;
  distanceKm: number | null;
  items: CartLine[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  scheduleMode: ScheduleMode;
  scheduledFor: string | null;
  status: OrderStatus;
  createdAt: string;
}

export type Order = OrderRecord;

export interface Customer {
  id: string;
  phone?: string;
  name: string;
  email?: string | null;
  authProvider: "phone" | "supabase";
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: "Home" | "Work" | "Other" | string;
  addressText: string;
  landmark?: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface PolicySection {
  heading: string;
  content: string[];
}

export interface PolicyDocument {
  title: string;
  description: string;
  sections: PolicySection[];
}
