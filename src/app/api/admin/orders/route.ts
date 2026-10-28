import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrders, updateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "new",
  "preparing",
  "out_for_delivery",
  "completed",
  "cancelled",
];

export async function GET(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const branchFilter = searchParams.get("branchId");

  let orders = await getOrders();
  if (statusFilter && statusFilter !== "all") {
    orders = orders.filter((o) => o.status === statusFilter);
  }
  if (branchFilter && branchFilter !== "all") {
    orders = orders.filter((o) => o.branchId === branchFilter);
  }

  return NextResponse.json({
    success: true,
    orders,
  });
}

export async function PATCH(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const status = String(body.status ?? "") as OrderStatus;

    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID or status." },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update order." },
      { status: 500 }
    );
  }
}
