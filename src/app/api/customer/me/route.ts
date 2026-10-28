import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentCustomer, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { createOrUpdateCustomer } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ authenticated: false, customer: null });
  }
  return NextResponse.json({ authenticated: true, customer });
}

export async function POST(req: Request) {
  // Logout
  const cookieStore = cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function PUT(req: Request) {
  const current = await getCurrentCustomer();
  if (!current) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const updated = await createOrUpdateCustomer({
    phone: current.phone,
    name: body.name || current.name,
    email: body.email ?? current.email,
  });

  return NextResponse.json({ success: true, customer: updated });
}
