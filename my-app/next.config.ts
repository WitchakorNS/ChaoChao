import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled for the CHAOCHAO demo: the app renders through a client-side mock
  // store (persona/bookings/notifications), which is incompatible with the
  // strict Suspense boundaries that Cache Components (PPR) requires.
  cacheComponents: false,
};

export default nextConfig;
