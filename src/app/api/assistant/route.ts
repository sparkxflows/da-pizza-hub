import { NextResponse } from "next/server";
import { getBranches, getCoupons, getMenuItems } from "@/lib/db";
import { BRAND_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const msg = String(body.message ?? "").toLowerCase().trim();
    const [items, branches, allCoupons] = await Promise.all([
      getMenuItems(false),
      getBranches(),
      getCoupons(),
    ]);
    const coupons = allCoupons.filter((c) => c.isActive);

    if (
      msg.includes("best") ||
      msg.includes("popular") ||
      msg.includes("recommend") ||
      msg.includes("top")
    ) {
      const best = items.filter((i) => i.isBestSeller).slice(0, 6);
      const list = best
        .map((i) =>
          i.type === "pizza"
            ? `• ${i.name} — ₹${i.prices.regular} (R) / ₹${i.prices.medium} (M)`
            : `• ${i.name} — ₹${i.price}`
        )
        .join("\n");
      return NextResponse.json({
        success: true,
        reply: {
          text: `Here are our customer favourites (100% Pure Veg):\n\n${list}\n\nTap any pizza on the Menu page to customize crust, cheese burst & toppings!`,
          suggestions: [
            "Any coupon codes?",
            "Where are your branches?",
            "What burgers do you have?",
          ],
        },
      });
    }

    if (
      msg.includes("branch") ||
      msg.includes("location") ||
      msg.includes("where") ||
      msg.includes("store") ||
      msg.includes("address")
    ) {
      const list = branches
        .map((b) => `📍 ${b.name}\n${b.address}\n📞 +91 ${b.phone}`)
        .join("\n\n");
      return NextResponse.json({
        success: true,
        reply: {
          text: `Welcome to Da Pizza Hub Hansi!\n\n📍 Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033\n📞 Phone: +91 99112 73199\n\nWe deliver fresh & piping hot across Hansi!`,
          suggestions: [
            "Do you deliver to me?",
            "Show best sellers",
            "Opening timings?",
          ],
        },
      });
    }

    if (
      msg.includes("deliver") ||
      msg.includes("charge") ||
      msg.includes("fee") ||
      msg.includes("minimum") ||
      msg.includes("radius")
    ) {
      return NextResponse.json({
        success: true,
        reply: {
          text: `🛵 Delivery Policy:\n• Minimum Order: ₹${BRAND_CONFIG.minOrder}\n• FREE Delivery within ${BRAND_CONFIG.freeDeliveryRadiusKm} KM of any branch!\n• 3–5 KM: ₹30 flat\n• Up to ${BRAND_CONFIG.nearestBranchSearchRadiusKm} KM: ₹30 + ₹10/km above 5 KM\n\nEnter your address at Checkout to check live distance & ETA (avg 30–45 mins).`,
          suggestions: [
            "Any coupon codes?",
            "Show best sellers",
            "Where are your branches?",
          ],
        },
      });
    }

    if (
      msg.includes("coupon") ||
      msg.includes("offer") ||
      msg.includes("discount") ||
      msg.includes("deal") ||
      msg.includes("code")
    ) {
      const text = coupons.length
        ? coupons
            .map((c) => `🎟️ ${c.code} — ${c.description}`)
            .join("\n")
        : "Check out our Special Offers section on the home page!";
      return NextResponse.json({
        success: true,
        reply: {
          text: `Active offers & coupon codes you can apply in your cart:\n\n${text}`,
          suggestions: [
            "Show best sellers",
            "Pizza prices?",
            "Do you deliver to me?",
          ],
        },
      });
    }

    if (msg.includes("burger")) {
      const burgers = items.filter((i) => i.category === "burger");
      const list = burgers
        .map((i) => `• ${i.name} — ₹${i.type === "simple" ? i.price : ""}`)
        .join("\n");
      return NextResponse.json({
        success: true,
        reply: {
          text: `🍔 Our Pure Veg Burgers:\n\n${list}`,
          suggestions: ["Pasta & Wraps?", "Shakes?", "Show best sellers"],
        },
      });
    }

    if (msg.includes("pasta") || msg.includes("wrap") || msg.includes("bread")) {
      const sides = items.filter((i) =>
        ["pasta", "wrap", "bread"].includes(i.category)
      );
      const list = sides
        .slice(0, 8)
        .map((i) => `• ${i.name} — ₹${i.type === "simple" ? i.price : ""}`)
        .join("\n");
      return NextResponse.json({
        success: true,
        reply: {
          text: `🍝 Fresh Pasta, Wraps & Garlic Bread:\n\n${list}`,
          suggestions: ["Shakes?", "Any coupon codes?", "Show best sellers"],
        },
      });
    }

    if (msg.includes("shake") || msg.includes("drink")) {
      const shakes = items.filter((i) => i.category === "shake");
      const list = shakes
        .map((i) => `• ${i.name} — ₹${i.type === "simple" ? i.price : ""}`)
        .join("\n");
      return NextResponse.json({
        success: true,
        reply: {
          text: `🥤 Thick & Creamy Shakes:\n\n${list}`,
          suggestions: ["Show best sellers", "Any coupon codes?"],
        },
      });
    }

    if (msg.includes("time") || msg.includes("open") || msg.includes("hour")) {
      return NextResponse.json({
        success: true,
        reply: {
          text: "⏰ We are open daily from 11:00 AM to 11:00 PM across our branches! You can order for immediate delivery or schedule a slot for later at checkout.",
          suggestions: [
            "Show best sellers",
            "Where are your branches?",
            "Any coupon codes?",
          ],
        },
      });
    }

    if (msg.includes("pizza") || msg.includes("price") || msg.includes("menu")) {
      return NextResponse.json({
        success: true,
        reply: {
          text: "🍕 Our 100% Pure Veg Pizzas start at just ₹120 (Regular 7\"), ₹229 (Medium 10\"), and ₹369 (Large 13\") across 6 signature tiers — Simply Veg, Veg Treat, Veg Delight, Veg Feast, Veg Special & Royal Special!\n\nYou can also add Extra Cheese, Cheese Burst, Pan Base & 8 farm-fresh toppings.",
          suggestions: [
            "Show best sellers",
            "Any coupon codes?",
            "What burgers do you have?",
          ],
        },
      });
    }

    return NextResponse.json({
      success: true,
      reply: {
        text: "Welcome to Da Pizza Hub! 🍕 Everything we bake is 100% Pure Vegetarian. I can help you with:\n• Best-selling pizzas & menu prices\n• Active coupon codes (try FIRST30!)\n• Our Hansi store (Gandhi Market, Near Ambedkar Chowk)\n• Free delivery radius & timings",
        suggestions: [
          "Show best sellers",
          "Any coupon codes?",
          "Store address & timings",
          "Do you deliver to me?",
        ],
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Assistant unavailable.",
      },
      { status: 500 }
    );
  }
}
