import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Casper | Explainable Cryptocurrency Forensics & Graph Intelligence",
  description:
    "Casper — Powered by FalkorDB Graph Reasoning. Multi-hop fund tracing, peel chain detection, and explainable forensic case reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} bg-[#F8FAFC] text-slate-900 min-h-screen antialiased selection:bg-emerald-500/20 selection:text-emerald-900 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
