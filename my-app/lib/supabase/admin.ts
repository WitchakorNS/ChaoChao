import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client used ONLY for server-side writes.
 *
 * The demo has no real Supabase Auth session (it uses a mock login), so the
 * anon key only carries SELECT grants. All mutations run through Route
 * Handlers on the server with this elevated client.
 *
 * The key is read from SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix), so
 * it is never bundled into client JavaScript. Never import this from a Client
 * Component.
 *
 * Per the Fluid-compute guidance used elsewhere in this project, a fresh
 * client is created per call rather than cached in module scope.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — " +
        "writes require the local Supabase instance to be running.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
