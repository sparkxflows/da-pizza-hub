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

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "today"; // "today" | "yesterday" | "week" | "month"

  const allOrders = await getOrders();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  let startTime: number;
  let endTime: number = Date.now();
  let periodLabel = "Today";

  if (period === "yesterday") {
    startTime = startOfYesterday.getTime();
    endTime = startOfToday.getTime();
    periodLabel = "Yesterday";
  } else if (period === "week") {
    startTime = startOfToday.getTime() - 6 * 86400000;
    periodLabel = "Last 7 Days (Per Week)";
  } else if (period === "month") {
    startTime = startOfToday.getTime() - 29 * 86400000;
    periodLabel = "Last 30 Days (Per Month)";
  } else {
    // "today" (default)
    startTime = startOfToday.getTime();
    periodLabel = "Today (Per Day)";
  }

  const periodOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= startTime && t <= endTime;
  });

  const priorPhones = new Set(
    allOrders
      .filter((o) => new Date(o.createdAt).getTime() < startTime)
      .map((o) => o.customerPhone)
  );

  let revenue = 0;
  let validOrderCount = 0;
  let cancelledOrders = 0;
  let codRevenue = 0;
  let upiRevenue = 0;
  const periodPhones = new Set<string>();
  const itemTallies = new Map<string, number>();
  const branchTallies = new Map<string, { revenue: number; orders: number }>();

  for (const ord of periodOrders) {
    if (ord.status === "cancelled") {
      cancelledOrders++;
      continue;
    }
    validOrderCount++;
    revenue += ord.total;
    if (ord.paymentMethod === "cod") {
      codRevenue += ord.total;
    } else {
      upiRevenue += ord.total;
    }

    periodPhones.add(ord.customerPhone);

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
  for (const phone of periodPhones) {
    if (priorPhones.has(phone)) repeatCustomers++;
    else newCustomers++;
  }

  const averageOrderValue =
    validOrderCount > 0 ? Math.round(revenue / validOrderCount) : 0;

  const topItems = Array.from(itemTallies.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  const branchBreakdown = Array.from(branchTallies.entries())
    .map(([branchId, stats]) => ({
      branchId,
      revenue: stats.revenue,
      orders: stats.orders,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    success: true,
    period,
    periodLabel,
    reportDate: new Date(startTime).toISOString(),
    revenue,
    codRevenue,
    upiRevenue,
    orders: validOrderCount,
    averageOrderValue,
    newCustomers,
    repeatCustomers,
    cancelledOrders,
    topItems,
    branchBreakdown,
  });
}
