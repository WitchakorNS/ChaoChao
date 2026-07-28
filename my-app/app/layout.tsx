import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider, THEME_SCRIPT } from "@/components/theme-provider";
import { DemoStoreProvider } from "@/lib/store";
import { getBookingsForUser, getUserById } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getUser } from "@/lib/mock/data";
import type { Booking, User } from "@/lib/mock/types";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CHAOCHAO — แพลตฟอร์มเช่าอุปกรณ์",
  description:
    "CHAOCHAO เช่าและปล่อยเช่าอุปกรณ์อย่างมั่นใจ ยืนยันตัวตน มัดจำ หลักฐานรูปภาพ และรีวิว",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Who is logged in (from the cookie; defaults to the demo user).
  const currentUserId = await getCurrentUserId();

  // Hydrate the client store with that user's data + bookings from the DB.
  // Falls back to mock data if the local Supabase isn't running.
  let initialBookings: Booking[] | undefined;
  let currentUser: User | undefined;
  try {
    [initialBookings, currentUser] = await Promise.all([
      getBookingsForUser(currentUserId),
      getUserById(currentUserId),
    ]).then(([b, u]) => [b, u ?? undefined] as [Booking[], User | undefined]);
  } catch {
    initialBookings = undefined;
    currentUser = undefined;
  }
  // Last-resort fallback so `me` is never empty.
  currentUser = currentUser ?? getUser(currentUserId) ?? getUser("u_me");

  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* No-flash theme init. Rendered via next/script `beforeInteractive`,
            which Next injects into the initial HTML before hydration — so no
            raw <script> is emitted by a React component (avoids React 19.2's
            "script tag while rendering" warning). See theme-provider.tsx. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <ThemeProvider>
          <DemoStoreProvider
            currentUserId={currentUserId}
            currentUser={currentUser}
            initialBookings={initialBookings}
          >
            {children}
          </DemoStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
