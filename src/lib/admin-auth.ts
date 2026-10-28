import { cookies, headers } from "next/headers";

export const ADMIN_COOKIE_NAME = "dph_admin_session";
export const SUPER_ADMIN_TOKEN = "dph_super_admin_v1";
export const STORE_ADMIN_TOKEN = "dph_staff_authenticated_v1";

export type AdminRole = "super_admin" | "admin";

export function getSuperAdminPassword(): string {
  return process.env.SUPER_ADMIN_PASSWORD?.trim() || "superadmin123";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "admin123";
}

export function isPasswordConfigured(): boolean {
  return true;
}

export function verifyAdminPassword(password: string): boolean {
  return verifyAdminPasswordWithRole(password).success;
}

export function verifyAdminPasswordWithRole(password: string): {
  success: boolean;
  role?: AdminRole;
} {
  const clean = password.trim();
  const superPwd = getSuperAdminPassword();
  const adminPwd = getAdminPassword();

  if (clean === superPwd) {
    return { success: true, role: "super_admin" };
  }
  if (clean === adminPwd) {
    return { success: true, role: "admin" };
  }
  return { success: false };
}

export function createAdminSessionToken(role: AdminRole = "admin"): string {
  return role === "super_admin" ? SUPER_ADMIN_TOKEN : STORE_ADMIN_TOKEN;
}

export function getAdminRoleFromToken(token: string | null | undefined): AdminRole | null {
  if (!token) return null;
  if (token === SUPER_ADMIN_TOKEN) return "super_admin";
  if (token === STORE_ADMIN_TOKEN) return "admin";
  return null;
}

export function getAdminRole(req?: Request): AdminRole | null {
  if (req) {
    const headerToken = req.headers.get("x-admin-token");
    if (headerToken) {
      const role = getAdminRoleFromToken(headerToken);
      if (role) return role;
    }

    const cookieHeader = req.headers.get("cookie") ?? "";
    if (cookieHeader.includes(`${ADMIN_COOKIE_NAME}=${SUPER_ADMIN_TOKEN}`)) {
      return "super_admin";
    }
    if (cookieHeader.includes(`${ADMIN_COOKIE_NAME}=${STORE_ADMIN_TOKEN}`)) {
      return "admin";
    }
  }

  try {
    const cookieStore = cookies();
    const c = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const roleFromCookie = getAdminRoleFromToken(c);
    if (roleFromCookie) return roleFromCookie;

    const hdrs = headers();
    const token = hdrs.get("x-admin-token");
    const roleFromHeader = getAdminRoleFromToken(token);
    if (roleFromHeader) return roleFromHeader;
  } catch {
    // outside request scope
  }
  return null;
}

export function isAdminAuthenticated(req?: Request): boolean {
  return getAdminRole(req) !== null;
}

export function isSuperAdminAuthenticated(req?: Request): boolean {
  return getAdminRole(req) === "super_admin";
}
