import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    if (!isPasswordConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin password is not set. Please add the ADMIN_PASSWORD environment variable in Vercel Project Settings.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const password = String(body.password ?? "");

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ success: true, token });

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
