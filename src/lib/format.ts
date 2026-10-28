import {
  BRAND_CONFIG,
  DEFAULT_BRANCHES,
  PIZZA_ADDONS,
  TOPPING_PRICE,
} from "./constants";
import type { Branch, PizzaCustomization } from "./types";

export function formatCurrency(amount?: number | null): string {
  const num = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoString;
  }
}

export function getEstimatedWindow(): string {
  const now = new Date();
  const from = new Date(now.getTime() + 30 * 60 * 1000);
  const to = new Date(now.getTime() + 45 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(from)} - ${fmt(to)}`;
}

export const formatEstimatedDeliveryWindow = getEstimatedWindow;

export interface DeliverySlot {
  value: string;
  label: string;
}

export function generateDeliverySlots(): {
  today: DeliverySlot[];
  tomorrow: DeliverySlot[];
} {
  const now = new Date();
  const minTodayTime = now.getTime() + 45 * 60 * 1000;

  const buildDaySlots = (dayOffset: number): DeliverySlot[] => {
    const slots: DeliverySlot[] = [];
    const base = new Date(now);
    base.setDate(base.getDate() + dayOffset);

    // 11:00 AM to 10:30 PM in 30-min increments
    for (let hour = 11; hour <= 22; hour++) {
      for (const minute of [0, 30]) {
        const slotDate = new Date(base);
        slotDate.setHours(hour, minute, 0, 0);
        if (dayOffset === 0 && slotDate.getTime() < minTodayTime) {
          continue;
        }
        slots.push({
          value: slotDate.toISOString(),
          label: slotDate.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        });
      }
    }
    return slots;
  };

  return {
    today: buildDaySlots(0),
    tomorrow: buildDaySlots(1),
  };
}

export function calculatePizzaUnitPrice(
  baseSizePrice: number,
  customization: PizzaCustomization
): number {
  let price = Number(baseSizePrice) || 0;
  const s = customization?.size || "medium";
  if (customization?.extraCheese && PIZZA_ADDONS.extraCheese[s]) {
    price += PIZZA_ADDONS.extraCheese[s];
  }
  if (customization?.cheeseBurst && PIZZA_ADDONS.cheeseBurst[s]) {
    price += PIZZA_ADDONS.cheeseBurst[s];
  }
  if (customization?.panBase && PIZZA_ADDONS.panBase[s]) {
    price += PIZZA_ADDONS.panBase[s];
  }
  const toppingsCount = Array.isArray(customization?.extraToppings)
    ? customization.extraToppings.length
    : 0;
  price += toppingsCount * (TOPPING_PRICE[s] || 0);
  return price;
}

export function formatCustomizationSummary(
  customization: PizzaCustomization,
  toppingNames: string[]
): string {
  const parts: string[] = [];
  if (customization.extraCheese) parts.push("Extra Cheese");
  if (customization.cheeseBurst) parts.push("Cheese Burst");
  if (customization.panBase) parts.push("Pan Base");
  if (toppingNames.length > 0) parts.push(`+${toppingNames.join(", ")}`);
  return parts.join(" · ") || "Classic";
}

export const buildCustomizationSummary = formatCustomizationSummary;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = degToRad(lat2 - lat1);
  const dLng = degToRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371;
}

export const haversineDistanceKm = haversineKm;

export function findNearestBranch(
  lat: number,
  lng: number,
  branches: Branch[] = DEFAULT_BRANCHES
): {
  branch: Branch;
  distance: number;
  fee: number;
  deliverable: boolean;
} {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`findNearestBranch: invalid coordinates (${lat}, ${lng}).`);
  }

  // Always calculate distance from the active Hansi store
  const hansiStore =
    branches.find(
      (b) => b.id === "Hansi" || b.address.toLowerCase().includes("hansi")
    ) || DEFAULT_BRANCHES[0];

  const distance = Number(
    haversineKm(lat, lng, hansiStore.lat, hansiStore.lng).toFixed(2)
  );
  const deliverable = distance <= BRAND_CONFIG.nearestBranchSearchRadiusKm;
  const fee = deliverable
    ? distance <= BRAND_CONFIG.freeDeliveryRadiusKm
      ? 0
      : distance <= 5
        ? 30
        : 30 + 10 * Math.ceil(distance - 5)
    : 0;

  return { branch: hansiStore, distance, fee, deliverable };
}

export function formatRelativeTime(isoDate: string): string {
  const mins = Math.floor(
    Math.max(0, Date.now() - new Date(isoDate).getTime()) / 60000
  );
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
