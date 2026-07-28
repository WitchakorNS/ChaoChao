import { cookies } from "next/headers";

// Cookie that holds the logged-in demo user's app id (e.g. "u_me", "u1").
// This is a lightweight, DB-backed "identity" login — NOT secure auth: there's
// no password verification, session token, or RLS. See app/api/auth/*.
export const CURRENT_USER_COOKIE = "chao_uid";

// Fallback keeps the demo working when nobody is logged in.
export const DEFAULT_USER_ID = "u_me";

/** Read the current user's app id from the cookie (server-only). */
export async function getCurrentUserId(): Promise<string> {
  const store = await cookies();
  return store.get(CURRENT_USER_COOKIE)?.value || DEFAULT_USER_ID;
}
