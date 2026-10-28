import { cookies } from "next/headers";
import crypto from "crypto";
import { findCustomerById, findCustomerByPhone } from "./db";
import type { Customer } from "./types";

const CUSTOMER_COOKIE_NAME = "dph_customer_session";
const SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || "dph_customer_secret_key_2026";

// In-memory OTP storage for fast verification (phone -> { code, expiresAt })
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOtp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  // Generate 4-digit OTP
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(cleanPhone, { code, expiresAt });
  return code;
}

export function verifyOtp(phone: string, inputCode: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const entry = otpStore.get(cleanPhone);
  
  // Allow demo OTP 1234 or real generated code
  if (inputCode.trim() === "1234") {
    otpStore.delete(cleanPhone);
    return true;
  }

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanPhone);
    return false;
  }
  if (entry.code === inputCode.trim()) {
    otpStore.delete(cleanPhone);
    return true;
  }
  return false;
}

export function createCustomerToken(customer: Customer): string {
  const payload = JSON.stringify({
    id: customer.id,
    phone: customer.phone,
    name: customer.name,
    email: customer.email,
    created: Date.now(),
  });
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${hmac}`).toString("base64url");
}

export function parseCustomerToken(token: string): Customer | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = raw.slice(0, lastDot);
    const signature = raw.slice(lastDot + 1);
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (signature !== expected) return null;
    const data = JSON.parse(payload);
    return {
      id: data.id,
      phone: data.phone,
      name: data.name,
      email: data.email,
      authProvider: "phone",
      createdAt: new Date(data.created).toISOString(),
    };
  } catch {
    return null;
  }
}

export function getCustomerSessionCookie(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get(CUSTOMER_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  const token = getCustomerSessionCookie();
  if (!token) return null;
  const parsed = parseCustomerToken(token);
  if (!parsed) return null;
  const dbCustomer = await findCustomerById(parsed.id);
  return dbCustomer ?? parsed;
}

export { CUSTOMER_COOKIE_NAME };
