import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio Planner — วางแผนเทรดอัจฉริยะ",
  description:
    "เครื่องมือคำนวณ Position Sizing อัตโนมัติ วิเคราะห์ความเสี่ยง และสรุปข่าวตลาดด้วย AI — ออกแบบมาเพื่อนักลงทุนมือใหม่ชาวไทย",
  keywords: [
    "portfolio planner",
    "risk calculator",
    "position sizing",
    "คำนวณความเสี่ยง",
    "วางแผนเทรด",
  ],
};

import { CurrencyProvider } from "@/context/currency-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`
        ${outfit.variable}
        ${inter.variable}
        ${jetbrainsMono.variable}
        ${notoSansThai.variable}
        h-full antialiased
      `}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: 'var(--font-body)',
          background: 'linear-gradient(180deg, oklch(0.98 0.005 265) 0%, oklch(0.97 0.01 85) 100%)',
        }}
      >
        <CurrencyProvider>
          <Navbar />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
