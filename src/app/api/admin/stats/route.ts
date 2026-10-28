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
  let lifetimeOrders = 0;
  let lifetimeRevenue = 0;

  let codOrders = 0;
  let codRevenue = 0;
  let upiOrders = 0;
  let upiRevenue = 0;

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
      lifetimeOrders++;
      lifetimeRevenue += ord.total;

      if (ord.paymentMethod === "cod") {
        codOrders++;
        codRevenue += ord.total;
      } else {
        upiOrders++;
        upiRevenue += ord.total;
      }

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

  // Return the full recent order history sorted descending
  const recentHistory = orders.slice(0, 50).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: o.status,
    itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    createdAt: o.createdAt,
  }));

  return NextResponse.json({
    success: true,
    today: { orders: todayOrders, revenue: todayRevenue },
    week: { orders: weekOrders, revenue: weekRevenue },
    month: { orders: monthOrders, revenue: monthRevenue },
    lifetime: { orders: lifetimeOrders, revenue: lifetimeRevenue },
    payments: {
      cod: { orders: codOrders, revenue: codRevenue },
      upi: { orders: upiOrders, revenue: upiRevenue },
    },
    status: statusCounts,
    topItems,
    recentHistory,
  });
}
