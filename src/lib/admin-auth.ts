import { cookies, headers } from "next/headers";

export const ADMIN_COOKIE_NAME = "dph_admin_session";
export const ADMIN_SESSION_VALUE = "dph_staff_authenticated_v1";

export function getAdminPassword(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.trim().length === 0) {
    return null;
  }
  return pwd.trim();
}

export function isPasswordConfigured(): boolean {
  return getAdminPassword() !== null;
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword || !password) return false;
  return password === adminPassword;
}

export function createAdminSessionToken(): string {
  return ADMIN_SESSION_VALUE;
}

export function isAdminAuthenticated(req?: Request): boolean {
  if (req) {
    const headerToken = req.headers.get("x-admin-token");
    if (headerToken === ADMIN_SESSION_VALUE) return true;

    const cookieHeader = req.headers.get("cookie") ?? "";
    if (cookieHeader.includes(`${ADMIN_COOKIE_NAME}=${ADMIN_SESSION_VALUE}`)) {
      return true;
    }
  }

  try {
    const cookieStore = cookies();
    const c = cookieStore.get(ADMIN_COOKIE_NAME);
    if (c?.value === ADMIN_SESSION_VALUE) return true;

    const hdrs = headers();
    const token = hdrs.get("x-admin-token");
    if (token === ADMIN_SESSION_VALUE) return true;
  } catch {
    // ignore outside request scope
  }
  return false;
}
