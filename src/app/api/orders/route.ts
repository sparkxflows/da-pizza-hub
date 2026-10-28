import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  createOrder,
  getBranches,
  getCouponByCode,
  getMenuItems,
  getOrderByNumberOrId,
  getOrders,
  incrementCouponUsage,
} from "@/lib/db";
import { BRAND_CONFIG, PRIMARY_STORE } from "@/lib/constants";
import { calculatePizzaUnitPrice, findNearestBranch } from "@/lib/format";
import type { CartLine, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const phone = searchParams.get("phone")?.replace(/\D/g, "").slice(-10);

    if (orderNumber) {
      const order = await getOrderByNumberOrId(orderNumber);
      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found." },
          { status: 404 }
        );
      }
      const branches = await getBranches();
      const branch =
        branches.find((b) => b.id === order.branchId) ??
        branches[0] ??
        PRIMARY_STORE;

      return NextResponse.json({
        success: true,
        order,
        branch,
      });
    }

    if (phone && phone.length === 10) {
      const allOrders = await getOrders();
      const userOrders = allOrders.filter(
        (o) => o.customerPhone.slice(-10) === phone
      );
      if (userOrders.length === 0) {
        return NextResponse.json(
          { success: false, message: "No orders found for this phone number." },
          { status: 404 }
        );
      }
      const branches = await getBranches();
      const latest = userOrders[0];
      const branch =
        branches.find((b) => b.id === latest.branchId) ??
        branches[0] ??
        PRIMARY_STORE;

      return NextResponse.json({
        success: true,
        order: latest,
        orders: userOrders.slice(0, 5),
        branch,
      });
    }

    return NextResponse.json(
      { success: false, message: "Please provide orderNumber or phone parameter." },
      { status: 400 }
    );
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to look up order." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [branches, menuItems] = await Promise.all([
      getBranches(),
      getMenuItems(false),
    ]);

    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "")
      .replace(/\D/g, "")
      .slice(-10);
    const customerEmail = body.customerEmail ? String(body.customerEmail).trim() : null;
    const deliveryAddress = String(body.deliveryAddress ?? "").trim();
    const orderType = body.orderType === "pickup" ? "pickup" : "delivery";
    const paymentMethod = body.paymentMethod === "upi" ? "upi" : "cod";
    const scheduleMode =
      body.scheduleMode === "scheduled" ? "scheduled" : "now";
    const scheduledFor =
      scheduleMode === "scheduled" && body.scheduledFor
        ? String(body.scheduledFor)
        : null;
    const idempotencyKey = body.idempotencyKey
      ? String(body.idempotencyKey)
      : undefined;

    if (customerName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (orderType === "delivery" && deliveryAddress.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a complete delivery address.",
        },
        { status: 400 }
      );
    }

    const rawItems: CartLine[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Server-side price recomputation against catalog
    const verifiedItems: CartLine[] = [];
    let computedSubtotal = 0;

    for (const line of rawItems) {
      const qty = Math.max(1, Math.floor(Number(line.quantity ?? 1)));
      const catalogItem = menuItems.find((m) => m.id === line.itemId);

      if (catalogItem) {
        if (catalogItem.type === "pizza" && line.customization) {
          const size = line.customization.size;
          const base = catalogItem.prices[size];
          const unitPrice = calculatePizzaUnitPrice(base, line.customization);
          verifiedItems.push({
            ...line,
            basePrice: base,
            unitPrice,
            quantity: qty,
          });
          computedSubtotal += unitPrice * qty;
        } else if (catalogItem.type === "simple") {
          verifiedItems.push({
            ...line,
            basePrice: catalogItem.price,
            unitPrice: catalogItem.price,
            quantity: qty,
          });
          computedSubtotal += catalogItem.price * qty;
        } else {
          verifiedItems.push({ ...line, quantity: qty });
          computedSubtotal += Number(line.unitPrice) * qty;
        }
      } else {
        verifiedItems.push({ ...line, quantity: qty });
        computedSubtotal += Number(line.unitPrice) * qty;
      }
    }

    if (orderType === "delivery" && computedSubtotal < BRAND_CONFIG.minOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order for delivery is ₹${BRAND_CONFIG.minOrder}.`,
        },
        { status: 400 }
      );
    }

    // Recompute coupon discount
    let computedDiscount = 0;
    const couponCode = body.couponCode
      ? String(body.couponCode).trim().toUpperCase()
      : null;

    if (couponCode) {
      const coupon = await getCouponByCode(couponCode);
      if (coupon && coupon.isActive && computedSubtotal >= coupon.minOrder) {
        computedDiscount =
          coupon.type === "percent"
            ? Math.round((computedSubtotal * coupon.value) / 100)
            : coupon.value;
        if (coupon.maxDiscount) {
          computedDiscount = Math.min(computedDiscount, coupon.maxDiscount);
        }
        computedDiscount = Math.min(computedDiscount, computedSubtotal);
      }
    }

    // Nearest branch & Haversine delivery fee
    let assignedBranch =
      branches.find((b) => b.id === body.branchId) ??
      branches.find((b) => b.id === "Hansi") ??
      branches[0] ??
      PRIMARY_STORE;
    let deliveryFee = 0;
    let distanceKm: number | null = null;
    const customerLat =
      typeof body.customerLat === "number" && Number.isFinite(body.customerLat)
        ? body.customerLat
        : null;
    const customerLng =
      typeof body.customerLng === "number" && Number.isFinite(body.customerLng)
        ? body.customerLng
        : null;

    if (orderType === "delivery" && customerLat !== null && customerLng !== null) {
      const nearest = findNearestBranch(customerLat, customerLng, branches);
      if (!nearest.deliverable) {
        return NextResponse.json(
          {
            success: false,
            message: `Sorry, we only deliver within ${BRAND_CONFIG.nearestBranchSearchRadiusKm} KM of our store in Hansi.`,
          },
          { status: 400 }
        );
      }
      assignedBranch = nearest.branch;
      deliveryFee = nearest.fee;
      distanceKm = nearest.distance;
    }

    const total = Math.max(0, computedSubtotal - computedDiscount) + deliveryFee;

    // Sequential daily order number: DPH-YYYYMMDD-001
    const allOrders = await getOrders();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePrefix = `DPH-${yyyy}${mm}${dd}-`;

    let maxSeq = 0;
    for (const o of allOrders) {
      if (o.orderNumber && o.orderNumber.startsWith(datePrefix)) {
        const seqPart = parseInt(o.orderNumber.replace(datePrefix, ""), 10);
        if (!isNaN(seqPart) && seqPart > maxSeq) {
          maxSeq = seqPart;
        }
      }
    }
    const orderNumber = `${datePrefix}${String(maxSeq + 1).padStart(3, "0")}`;

    const orderRecord: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      branchId: assignedBranch.id,
      orderType,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      customerLat,
      customerLng,
      distanceKm,
      items: verifiedItems,
      subtotal: computedSubtotal,
      discount: computedDiscount,
      couponCode,
      deliveryFee,
      total,
      paymentMethod,
      scheduleMode,
      scheduledFor,
      status: "new",
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    const saved = await createOrder(orderRecord);
    if (couponCode && saved.id === orderRecord.id) {
      try {
        await incrementCouponUsage(couponCode);
      } catch (couponErr) {
        console.warn("Coupon increment non-fatal error:", couponErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: saved.orderNumber,
      branchId: saved.branchId,
      deliveryFee: saved.deliveryFee,
      total: saved.total,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "We couldn't place your order right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
