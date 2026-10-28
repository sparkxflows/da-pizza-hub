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

  const allOrders = await getOrders();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  const yesterdayOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= startOfYesterday.getTime() && t < startOfToday.getTime();
  });

  const priorPhones = new Set(
    allOrders
      .filter((o) => new Date(o.createdAt).getTime() < startOfYesterday.getTime())
      .map((o) => o.customerPhone)
  );

  let revenue = 0;
  let validOrderCount = 0;
  let cancelledOrders = 0;
  const yesterdayPhones = new Set<string>();
  const itemTallies = new Map<string, number>();
  const branchTallies = new Map<string, { revenue: number; orders: number }>();

  for (const ord of yesterdayOrders) {
    if (ord.status === "cancelled") {
      cancelledOrders++;
      continue;
    }
    validOrderCount++;
    revenue += ord.total;
    yesterdayPhones.add(ord.customerPhone);

    for (const line of ord.items) {
      itemTallies.set(
        line.name,
        (itemTallies.get(line.name) ?? 0) + line.quantity
      );
    }

    const br = branchTallies.get(ord.branchId) ?? { revenue: 0, orders: 0 };
    br.revenue += ord.total;
    br.orders += 1;
    branchTallies.set(ord.branchId, br);
  }

  let newCustomers = 0;
  let repeatCustomers = 0;
  for (const phone of yesterdayPhones) {
    if (priorPhones.has(phone)) repeatCustomers++;
    else newCustomers++;
  }

  const averageOrderValue =
    validOrderCount > 0 ? Math.round(revenue / validOrderCount) : 0;

  const topItems = Array.from(itemTallies.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const branchBreakdown = Array.from(branchTallies.entries())
    .map(([branchId, stats]) => ({
      branchId,
      revenue: stats.revenue,
      orders: stats.orders,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    success: true,
    reportDate: startOfYesterday.toISOString(),
    revenue,
    orders: validOrderCount,
    averageOrderValue,
    newCustomers,
    repeatCustomers,
    cancelledOrders,
    topItems,
    branchBreakdown,
  });
}
