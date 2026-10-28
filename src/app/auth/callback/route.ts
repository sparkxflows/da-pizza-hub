import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { createOrUpdateCustomer } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const u = data.session.user;
      const email = u.email || "";
      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        (email ? email.split("@")[0] : "Customer");
      const phone = u.phone || u.user_metadata?.phone || undefined;
      const avatarUrl = u.user_metadata?.avatar_url || null;

      const customer = await createOrUpdateCustomer({
        id: u.id,
        name,
        email,
        phone,
        authProvider: "google",
        avatarUrl,
      });

      const token = createCustomerToken(customer);
      const res = NextResponse.redirect(new URL("/", origin));

      res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return res;
    }
  }

  return NextResponse.redirect(new URL("/", origin));
}
