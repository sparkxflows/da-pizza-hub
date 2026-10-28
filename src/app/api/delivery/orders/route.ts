import { NextResponse } from "next/server";
import { getOrders, updateOrderStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getOrders();
    const today = new Date().toISOString().slice(0, 10);

    // Active deliveries: out_for_delivery or preparing
    const active = orders.filter((o) => o.status === "out_for_delivery");
    
    // Deliveries completed today
    const completedToday = orders.filter(
      (o) => o.status === "completed" && o.createdAt.startsWith(today)
    );

    // Total COD cash collected today
    const codCollectedToday = completedToday
      .filter((o) => o.paymentMethod === "cod")
      .reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      active,
      completedToday,
      stats: {
        activeCount: active.length,
        completedCount: completedToday.length,
        codCollectedToday,
      },
    });
  } catch (err) {
    console.error("GET /api/delivery/orders error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load delivery orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId || "");
    const action = String(body.action || "");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    if (action === "deliver") {
      const updated = await updateOrderStatus(orderId, "completed");
      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Order not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Order marked as delivered successfully!",
        order: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST /api/delivery/orders error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update delivery status." },
      { status: 500 }
    );
  }
}
