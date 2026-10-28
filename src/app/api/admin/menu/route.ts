import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteMenuItem,
  getMenuItems,
  patchMenuItem,
  upsertMenuItem,
} from "@/lib/db";
import type { MenuCategory, MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function toAdminMenuRow(item: MenuItem) {
  if (item.type === "pizza") {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      item_type: "pizza" as const,
      price_regular: item.prices.regular,
      price_medium: item.prices.medium,
      price_large: item.prices.large,
      price: null,
      image: item.image ?? "",
      is_best_seller: !!item.isBestSeller,
      is_new: !!item.isNew,
      is_available: item.isAvailable !== false,
    };
  }
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    category: item.category,
    item_type: "simple" as const,
    price_regular: null,
    price_medium: null,
    price_large: null,
    price: item.price,
    image: item.image ?? "",
    is_best_seller: !!item.isBestSeller,
    is_new: !!item.isNew,
    is_available: item.isAvailable !== false,
  };
}

export async function GET(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const items = (await getMenuItems(true)).map(toAdminMenuRow);
  return NextResponse.json({ success: true, items });
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    const slug =
      body.id ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 5);

    const category = String(body.category ?? "veg-special") as MenuCategory;
    const itemType = body.itemType === "pizza" ? "pizza" : "simple";

    const newItem: MenuItem =
      itemType === "pizza"
        ? {
            id: slug,
            name,
            description: String(body.description ?? ""),
            category,
            type: "pizza",
            prices: {
              regular: Number(body.priceRegular ?? 0),
              medium: Number(body.priceMedium ?? 0),
              large: Number(body.priceLarge ?? 0),
            },
            image: String(body.image || "/images/pizza-generic/pizza-1.webp"),
            isBestSeller: !!body.isBestSeller,
            isNew: !!body.isNew,
            isAvailable: true,
          }
        : {
            id: slug,
            name,
            description: String(body.description ?? ""),
            category,
            type: "simple",
            price: Number(body.price ?? 0),
            image: String(body.image || "/images/pizza-generic/pizza-1.webp"),
            isBestSeller: !!body.isBestSeller,
            isNew: !!body.isNew,
            isAvailable: true,
          };

    const saved = await upsertMenuItem(newItem);
    return NextResponse.json({
      success: true,
      item: toAdminMenuRow(saved),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create item." },
      { status: 500 }
    );
  }
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
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required." },
        { status: 400 }
      );
    }

    const updated = await patchMenuItem(id, {
      name: body.name,
      description: body.description,
      category: body.category,
      image: body.image,
      isBestSeller: body.isBestSeller,
      isNew: body.isNew,
      isAvailable: body.isAvailable,
      price: body.price !== undefined ? Number(body.price) : undefined,
      priceRegular:
        body.priceRegular !== undefined ? Number(body.priceRegular) : undefined,
      priceMedium:
        body.priceMedium !== undefined ? Number(body.priceMedium) : undefined,
      priceLarge:
        body.priceLarge !== undefined ? Number(body.priceLarge) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: toAdminMenuRow(updated),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update item." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing item id." },
      { status: 400 }
    );
  }

  const ok = await deleteMenuItem(id);
  return NextResponse.json({ success: ok });
}
