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
  // OpenGraph + Twitter cards para previews al compartir el link (WhatsApp,
  // LinkedIn, Twitter, etc.). La imagen la sirve automáticamente Next.js
  // desde app/opengraph-image.png y app/twitter-image.png — sólo necesitamos
  // los campos textuales para que el copy del preview sea correcto.
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "BØLG Corporativo",
    title: "BØLG Corporativo — Regalos corporativos personalizados",
    description:
      "Mochilas, botellas y accesorios BØLG personalizados con tu logo. Precios por volumen, stock real y preview de cómo se ve antes de aprobar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BØLG Corporativo — Regalos corporativos personalizados",
    description:
      "Mochilas, botellas y accesorios BØLG personalizados con tu logo. Precios por volumen, stock real y preview de cómo se ve antes de aprobar.",
  },
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
