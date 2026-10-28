import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { createOrUpdateCustomer, findCustomerByEmail } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name, phone } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let customerPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    if (customerPhone.length !== 10) {
      customerPhone = "";
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      if (action === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: String(password),
          options: { data: { name: name || cleanEmail.split("@")[0], ...(customerPhone ? { phone: customerPhone } : {}) } },
        });

        if (error) {
          return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: String(password),
        });

        if (error) {
          return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
          );
        }
      }
    }

    // Create or update customer in database
    const customer = await createOrUpdateCustomer({
      phone: customerPhone || undefined,
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      authProvider: "supabase",
    });

    const token = createCustomerToken(customer);

    const cookieStore = cookies();
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: action === "signup" ? "Account created successfully!" : "Signed in successfully!",
      customer,
      token,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Supabase authentication failed." },
      { status: 500 }
    );
  }
}
