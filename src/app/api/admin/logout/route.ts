import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const res = NextResponse.json({ success: true });
  const proto = req.headers.get("x-forwarded-proto") ?? "";
  const isHttps = proto.includes("https") || req.url.startsWith("https://");

  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
  });
  return res;
}
