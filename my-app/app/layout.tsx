import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { DemoStoreProvider } from "@/lib/store";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DemoStoreProvider>{children}</DemoStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
