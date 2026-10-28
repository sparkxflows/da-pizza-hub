import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminPasswordWithRole,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password ?? "");

    const authResult = verifyAdminPasswordWithRole(password);
    if (!authResult.success || !authResult.role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Incorrect password. Please enter a valid Admin or Super Admin password.",
        },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(authResult.role);
    const res = NextResponse.json({
      success: true,
      token,
      role: authResult.role,
      message:
        authResult.role === "super_admin"
          ? "Logged in as Super Admin"
          : "Logged in as Store Admin",
    });

    const proto = req.headers.get("x-forwarded-proto") ?? "";
    const isHttps = proto.includes("https") || req.url.startsWith("https://");

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: isHttps ? "none" : "lax",
      secure: isHttps,
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed." },
      { status: 500 }
    );
  }
}
