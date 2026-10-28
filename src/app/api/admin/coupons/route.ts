import { NextResponse } from "next/server";
import { isSuperAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteCoupon,
  getCoupons,
  patchCoupon,
  upsertCoupon,
} from "@/lib/db";
import type { Coupon } from "@/lib/types";

export const dynamic = "force-dynamic";

function toAdminCouponRow(c: Coupon) {
  return {
    code: c.code,
    type: c.type,
    value: c.value,
    min_order: c.minOrder,
    max_discount: c.maxDiscount ?? null,
    description: c.description,
    usage_limit: c.usageLimit ?? null,
    used_count: c.usedCount,
    is_active: c.isActive,
  };
}

export async function GET(req: Request) {
  if (!isSuperAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Super Admin privileges required to manage promo coupons." },
      { status: 403 }
    );
  }

  const coupons = (await getCoupons()).map(toAdminCouponRow);
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: Request) {
  if (!isSuperAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Super Admin privileges required to create promo coupons." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const code = String(body.code ?? "")
      .trim()
      .toUpperCase();
    const type = body.type === "percent" ? "percent" : "flat";
    const value = Number(body.value ?? 0);

    if (!code || value <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid code and value are required." },
        { status: 400 }
      );
    }

    const coupon: Coupon = {
      code,
      type,
      value,
      minOrder: Number(body.minOrder ?? 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      description:
        String(body.description ?? "").trim() ||
        (type === "percent" ? `${value}% OFF` : `Flat ₹${value} OFF`),
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      usedCount: 0,
      isActive: true,
    };

    const saved = await upsertCoupon(coupon);
    return NextResponse.json({
      success: true,
      coupon: toAdminCouponRow(saved),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save coupon." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isSuperAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Super Admin privileges required to edit coupons." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const code = String(body.code ?? "");
    const updated = await patchCoupon(code, {
      type: body.type,
      value: body.value !== undefined ? Number(body.value) : undefined,
      minOrder: body.minOrder !== undefined ? Number(body.minOrder) : undefined,
      maxDiscount:
        body.maxDiscount !== undefined
          ? body.maxDiscount
            ? Number(body.maxDiscount)
            : undefined
          : undefined,
      description: body.description,
      usageLimit:
        body.usageLimit !== undefined
          ? body.usageLimit
            ? Number(body.usageLimit)
            : undefined
          : undefined,
      isActive: body.isActive,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Coupon not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: toAdminCouponRow(updated),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isSuperAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Super Admin privileges required to delete coupons." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { success: false, message: "Missing coupon code." },
      { status: 400 }
    );
  }

  const ok = await deleteCoupon(code);
  return NextResponse.json({ success: ok });
}
