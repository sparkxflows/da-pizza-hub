"use client";

export const ADMIN_TOKEN_STORAGE_KEY = "dph_admin_token";

export function saveAdminToken(token?: string) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export type ClientAdminRole = "super_admin" | "admin";

export function getClientAdminRole(): ClientAdminRole | null {
  const token = getAdminToken();
  if (!token) return null;
  if (token === "dph_super_admin_v1") return "super_admin";
  if (token === "dph_staff_authenticated_v1") return "admin";
  return null;
}

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("x-admin-token", token);
  }
  return fetch(input, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });
}
