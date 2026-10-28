import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getBranches, upsertBranch } from "@/lib/db";
import type { Branch } from "@/lib/types";

export const dynamic = "force-dynamic";

function toAdminBranchRow(b: Branch) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    whatsapp: b.whatsapp,
    maps_url: b.mapsUrl,
    swiggy_url: b.swiggyUrl ?? null,
    zomato_url: b.zomatoUrl ?? null,
    lat: b.lat,
    lng: b.lng,
  };
}

export async function GET(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const branches = (await getBranches()).map(toAdminBranchRow);
  return NextResponse.json({ success: true, branches });
}

async function saveBranchHandler(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = String(body.id ?? "").trim();
    const name = String(body.name ?? "").trim();
    const address = String(body.address ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!id || !name || !address || !phone || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        {
          success: false,
          message: "Branch ID, name, address, phone, and coordinates are required.",
        },
        { status: 400 }
      );
    }

    const branch: Branch = {
      id,
      name,
      address,
      phone,
      whatsapp: String(body.whatsapp || `91${phone.replace(/\D/g, "").slice(-10)}`),
      mapsUrl: String(body.mapsUrl ?? ""),
      swiggyUrl: body.swiggyUrl ? String(body.swiggyUrl) : undefined,
      zomatoUrl: body.zomatoUrl ? String(body.zomatoUrl) : undefined,
      lat,
      lng,
    };

    const saved = await upsertBranch(branch);
    return NextResponse.json({
      success: true,
      branch: toAdminBranchRow(saved),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save branch." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return saveBranchHandler(req);
}

export async function PATCH(req: Request) {
  return saveBranchHandler(req);
}
