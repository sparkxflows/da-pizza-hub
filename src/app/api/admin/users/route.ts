import { NextResponse } from "next/server";
import { isSuperAdminAuthenticated } from "@/lib/admin-auth";
import { getAllCustomersWithStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isSuperAdminAuthenticated(req)) {
    return NextResponse.json(
      {
        success: false,
        message: "Super Admin privileges required to view user profiles.",
      },
      { status: 403 }
    );
  }

  try {
    const users = await getAllCustomersWithStats();
    return NextResponse.json({
      success: true,
      users,
      totalCount: users.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load users." },
      { status: 500 }
    );
  }
}
