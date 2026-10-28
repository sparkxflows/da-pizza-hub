import seedMenuJson from "./seed-menu.json";
import seedPoliciesJson from "./seed-policies.json";
import type {
  Branch,
  MenuCategory,
  MenuItem,
  PizzaSize,
  PolicyDocument,
} from "./types";

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "Hansi",
    name: "Da Pizza Hub – Hansi",
    address:
      "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
    phone: "9911273199",
    whatsapp: "919911273199",
    mapsUrl: "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6",
    swiggyUrl: undefined,
    zomatoUrl: "https://www.zomato.com/hansi/da-pizza-hub-hansi-locality",
    lat: 29.0941994,
    lng: 75.9622477,
  },
];

export const PRIMARY_STORE = DEFAULT_BRANCHES[0];

export const BRAND_CONFIG = {
  name: "Da Pizza Hub",
  tagline: "Freshly Baked. 100% Pure Veg. Crafted To Perfection.",
  website: "www.dapizzahub.in",
  storeAddress:
    "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033",
  phone: "+91 99112 73199",
  whatsapp: "919911273199",
  email: "dapizzahubhansi@gmail.com",
  mapsUrl: "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6",
  minOrder: 300,
  freeDeliveryRadiusKm: 3,
  nearestBranchSearchRadiusKm: 25,
  social: {
    instagram: "https://www.instagram.com/da_pizzahub_hansi/",
    facebook: "https://www.facebook.com/dapizzahubhansi/",
    twitter: "#",
  },
  footerLink: {
    label: "SparkXFlow",
    url: "https://www.sparkxflow.com/",
  },
  founders: {
    names: "Da Pizza Hub – Hansi",
    photo: "/brand/hansi-story-logo.webp",
    yearsInBusiness: 10,
    story: [
      "Da Pizza Hub began with a simple idea: pure vegetarian pizza that didn't compromise on taste, freshness, or honesty about what goes into it.",
      "Located at Gandhi Market near Ambedkar Chowk in Hansi, Haryana, we believe everyone deserves a proper pure-veg gourmet pizza experience — with fresh hand-stretched dough and 100% real dairy mozzarella cheese.",
      "Every pizza is freshly baked to order, every topping hand-selected. Taste the difference in every slice!",
    ],
  },
};

export const PIZZA_ADDONS: Record<
  "extraCheese" | "cheeseBurst" | "panBase",
  Record<PizzaSize, number>
> = {
  extraCheese: { regular: 40, medium: 60, large: 80 },
  cheeseBurst: { regular: 65, medium: 85, large: 120 },
  panBase: { regular: 20, medium: 40, large: 40 },
};

export const PIZZA_TOPPINGS = [
  { id: "olive", name: "Olive" },
  { id: "tomato", name: "Tomato" },
  { id: "onion", name: "Onion" },
  { id: "paneer", name: "Paneer" },
  { id: "capsicum", name: "Capsicum" },
  { id: "mushroom", name: "Mushroom" },
  { id: "corn", name: "Corn" },
  { id: "jalapeno", name: "Jalapeno" },
] as const;

export const VEG_TOPPINGS = PIZZA_TOPPINGS;

export const TOPPING_PRICE: Record<PizzaSize, number> = {
  regular: 30,
  medium: 45,
  large: 55,
};

export const TOPPING_PRICES = TOPPING_PRICE;

export const PIZZA_SIZE_META: Record<
  PizzaSize,
  { label: string; note: string }
> = {
  regular: { label: "Regular", note: '7" · Serves 1' },
  medium: { label: "Medium", note: '10" · Serves 2' },
  large: { label: "Large", note: '13" · Serves 4' },
};

export const PIZZA_SIZES = PIZZA_SIZE_META;

export const MENU_CATEGORY_GROUPS: {
  label: string;
  categories: { key: MenuCategory; label: string }[];
}[] = [
  {
    label: "Pizza",
    categories: [
      { key: "royal-special", label: "Royal Special" },
      { key: "veg-special", label: "Veg Special" },
      { key: "veg-feast", label: "Veg Feast" },
      { key: "veg-delight", label: "Veg Delight" },
      { key: "veg-treat", label: "Veg Treat" },
      { key: "simply-veg", label: "Simply Veg" },
    ],
  },
  {
    label: "More",
    categories: [
      { key: "burger", label: "Burgers" },
      { key: "fries", label: "Fries" },
      { key: "pasta", label: "Pasta" },
      { key: "wrap", label: "Wraps" },
      { key: "bread", label: "Garlic Bread" },
      { key: "sides-other", label: "Snacks" },
    ],
  },
];

export const ALL_MENU_CATEGORIES = MENU_CATEGORY_GROUPS.flatMap((g) =>
  g.categories.map((c) => c)
);

export const ALL_CATEGORY_TABS = ALL_MENU_CATEGORIES;

export const SEED_MENU_ITEMS: MenuItem[] = seedMenuJson as MenuItem[];

export const POLICIES: Record<"privacy" | "refund" | "terms", PolicyDocument> =
  seedPoliciesJson as Record<"privacy" | "refund" | "terms", PolicyDocument>;
