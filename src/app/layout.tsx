import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { AuthSync } from "@/components/auth/auth-sync";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "SPICY — Turn Up the Taste", template: "%s · SPICY" },
  description:
    "SPICY is a design prototype for a premium food-ordering experience. All dishes, orders and payments are simulated.",
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <AuthSync />
      </body>
    </html>
  );
}
