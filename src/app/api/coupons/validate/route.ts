import { NextResponse } from "next/server";
import { getCouponByCode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawCode = String(body.code ?? "").trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);

    if (!rawCode) {
      return NextResponse.json(
        { success: false, message: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    const coupon = await getCouponByCode(rawCode);
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired coupon code.",
      });
    }

    if (
      coupon.usageLimit !== undefined &&
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return NextResponse.json({
        success: false,
        message: "This coupon has reached its usage limit.",
      });
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrder} required for ${coupon.code}.`,
      });
    }

    let discount =
      coupon.type === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;

    if (coupon.maxDiscount !== undefined && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount,
      description: coupon.description,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
