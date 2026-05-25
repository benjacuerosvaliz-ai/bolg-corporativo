import type { Metadata } from "next";
import { Mona_Sans, Inter } from "next/font/google";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { BrandFooter } from "@/components/brand/BrandFooter";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/**
 * Inter como body font oficial de la plataforma corporativa.
 * (En bolg.cl retail se usa Basic Commercial — paga; decisión 2026-05-25:
 * la corporativa usa Inter, gratis y suficientemente cercana en feel.)
 */
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BØLG Corporativo — Cotización de productos personalizados",
    template: "%s · BØLG Corporativo",
  },
  description:
    "Plataforma B2B de BØLG. Cotiza mochilas, botellas y productos lifestyle personalizados con tu logo. Stock real, precios por volumen y timeline garantizado.",
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://corporativo.bolg.cl",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CL"
      className={`${monaSans.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bolg-bg text-bolg-text">
        <BrandHeader />
        <main className="flex-1">{children}</main>
        <BrandFooter />
      </body>
    </html>
  );
}
