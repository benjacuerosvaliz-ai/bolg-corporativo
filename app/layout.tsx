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
 * Body font temporal. La fuente oficial de BOLG es Basic Commercial
 * (Linotype, no en Google Fonts). Mientras Benja resuelve la licencia
 * de Adobe Fonts o self-host, usamos Inter como fallback neutro.
 */
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BOLG Corporativo — Cotización de productos personalizados",
    template: "%s · BOLG Corporativo",
  },
  description:
    "Plataforma B2B de BOLG. Cotiza mochilas, botellas y productos lifestyle personalizados con tu logo. Stock real, precios por volumen y timeline garantizado.",
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
