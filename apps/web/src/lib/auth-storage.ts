import type { User } from "@/types/auth";

const TOKEN_KEY = "equipment-rental.auth.token";
const USER_KEY = "equipment-rental.auth.user";

/**
 * Session lives in localStorage because the API returns the JWT in the response
 * body (it only accepts it via the Authorization header). Every access is
 * guarded: this module is imported by code that also runs during SSR, and
 * browsers in private mode can throw on access.
 */
function readItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: User): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable; the user will simply have to log in again later.
  }
}

export function getToken(): string | null {
  return readItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = readItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
