import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import {
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", addresses: [] },
      { status: 401 }
    );
  }

  const addresses = await getCustomerAddresses(customer.id);
  return NextResponse.json({ success: true, addresses });
}

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Please sign in to save addresses." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { label, addressText, landmark, isDefault, lat, lng } = body;

    if (!addressText || String(addressText).trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid delivery address in Hansi." },
        { status: 400 }
      );
    }

    const newAddr = await addCustomerAddress({
      customerId: customer.id,
      label: label || "Home",
      addressText: addressText.trim(),
      landmark: landmark?.trim() || "",
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, address: newAddr });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save address." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get("id");

  if (!addressId) {
    return NextResponse.json(
      { success: false, message: "Address ID required" },
      { status: 400 }
    );
  }

  const ok = await deleteCustomerAddress(customer.id, addressId);
  return NextResponse.json({ success: ok });
}
