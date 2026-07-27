import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider, THEME_SCRIPT } from "@/components/theme-provider";
import { DemoStoreProvider } from "@/lib/store";
import { getBookingsForUser } from "@/lib/db";
import { CURRENT_USER_ID } from "@/lib/mock/data";
import type { Booking } from "@/lib/mock/types";
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
  // Hydrate the client store with the demo user's real bookings from the DB.
  // Falls back to mock data if the local Supabase isn't running.
  let initialBookings: Booking[] | undefined;
  try {
    initialBookings = await getBookingsForUser(CURRENT_USER_ID);
  } catch {
    initialBookings = undefined;
  }

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
          <DemoStoreProvider initialBookings={initialBookings}>
            {children}
          </DemoStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
