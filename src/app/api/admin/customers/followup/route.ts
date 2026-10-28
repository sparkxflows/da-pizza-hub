import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const orders = (await getOrders()).filter((o) => o.status !== "cancelled");
  const now = Date.now();

  const byPhone = new Map<
    string,
    {
      name: string;
      phone: string;
      orderCount: number;
      lastOrderMs: number;
      itemCounts: Map<string, number>;
    }
  >();

  for (const ord of orders) {
    const phone = ord.customerPhone;
    const ms = new Date(ord.createdAt).getTime();
    const existing = byPhone.get(phone);

    if (!existing) {
      const itemCounts = new Map<string, number>();
      for (const item of ord.items) {
        itemCounts.set(
          item.name,
          (itemCounts.get(item.name) ?? 0) + item.quantity
        );
      }
      byPhone.set(phone, {
        name: ord.customerName,
        phone,
        orderCount: 1,
        lastOrderMs: ms,
        itemCounts,
      });
    } else {
      existing.orderCount += 1;
      if (ms > existing.lastOrderMs) {
        existing.lastOrderMs = ms;
        existing.name = ord.customerName;
      }
      for (const item of ord.items) {
        existing.itemCounts.set(
          item.name,
          (existing.itemCounts.get(item.name) ?? 0) + item.quantity
        );
      }
    }
  }

  const lapsed: {
    name: string;
    phone: string;
    daysSinceLastOrder: number;
    orderCount: number;
    favoriteItem: string | null;
  }[] = [];

  const newSingleOrder: {
    name: string;
    phone: string;
    daysSinceLastOrder: number;
    orderCount: number;
    favoriteItem: string | null;
  }[] = [];

  for (const c of byPhone.values()) {
    const daysSinceLastOrder = Math.floor((now - c.lastOrderMs) / 86400000);
    let favoriteItem: string | null = null;
    let maxQty = 0;
    for (const [name, qty] of c.itemCounts.entries()) {
      if (qty > maxQty) {
        maxQty = qty;
        favoriteItem = name;
      }
    }

    const summary = {
      name: c.name,
      phone: c.phone,
      daysSinceLastOrder,
      orderCount: c.orderCount,
      favoriteItem,
    };

    if (daysSinceLastOrder >= 14) {
      lapsed.push(summary);
    } else if (
      c.orderCount === 1 &&
      daysSinceLastOrder >= 2 &&
      daysSinceLastOrder < 14
    ) {
      newSingleOrder.push(summary);
    }
  }

  lapsed.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);
  newSingleOrder.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);

  return NextResponse.json({
    success: true,
    lapsed,
    newSingleOrder,
  });
}
