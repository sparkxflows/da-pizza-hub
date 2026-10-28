import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCustomerOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", orders: [] },
      { status: 401 }
    );
  }

  const orders = await getCustomerOrders(customer.phone, customer.name, customer.email);
  return NextResponse.json({ success: true, orders });
}
