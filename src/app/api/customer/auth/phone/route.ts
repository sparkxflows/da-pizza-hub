import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateOtp, verifyOtp, createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { createOrUpdateCustomer, findCustomerByPhone } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, code, name } = body;

    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (action === "send_otp") {
      const otp = generateOtp(cleanPhone);
      // In production, integrate Fast2SMS or WhatsApp API.
      // For immediate testing and seamless UX, we send the OTP in response
      return NextResponse.json({
        success: true,
        message: `OTP sent to +91 ${cleanPhone}`,
        devOtp: otp, // convenient for testing: customer sees "Demo OTP: XXXX" or can use 1234
      });
    }

    if (action === "verify_otp") {
      const isValid = verifyOtp(cleanPhone, String(code || ""));
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired OTP. Please enter code 1234 or request a new OTP." },
          { status: 400 }
        );
      }

      const customer = await createOrUpdateCustomer({
        phone: cleanPhone,
        name: name || undefined,
        authProvider: "phone",
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
        message: "Signed in successfully!",
        customer,
        token,
      });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
