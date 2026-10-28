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

  const orders = await getOrders();
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const ms7d = 7 * 86400000;
  const ms30d = 30 * 86400000;

  let todayOrders = 0;
  let todayRevenue = 0;
  let weekOrders = 0;
  let weekRevenue = 0;
  let monthOrders = 0;
  let monthRevenue = 0;

  const statusCounts = {
    new: 0,
    preparing: 0,
    outForDelivery: 0,
    completed: 0,
    cancelled: 0,
  };

  const itemTallies = new Map<string, number>();

  for (const ord of orders) {
    const t = new Date(ord.createdAt).getTime();
    const isCancelled = ord.status === "cancelled";

    if (ord.status === "new") statusCounts.new++;
    else if (ord.status === "preparing") statusCounts.preparing++;
    else if (ord.status === "out_for_delivery") statusCounts.outForDelivery++;
    else if (ord.status === "completed") statusCounts.completed++;
    else if (ord.status === "cancelled") statusCounts.cancelled++;

    if (!isCancelled) {
      if (t >= startOfToday.getTime()) {
        todayOrders++;
        todayRevenue += ord.total;
      }
      if (now - t <= ms7d) {
        weekOrders++;
        weekRevenue += ord.total;
      }
      if (now - t <= ms30d) {
        monthOrders++;
        monthRevenue += ord.total;
        for (const line of ord.items) {
          itemTallies.set(
            line.name,
            (itemTallies.get(line.name) ?? 0) + line.quantity
          );
        }
      }
    }
  }

  const topItems = Array.from(itemTallies.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    today: { orders: todayOrders, revenue: todayRevenue },
    week: { orders: weekOrders, revenue: weekRevenue },
    month: { orders: monthOrders, revenue: monthRevenue },
    status: statusCounts,
    topItems,
  });
}
