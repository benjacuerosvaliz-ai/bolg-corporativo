import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { QuoteBadge } from "./QuoteBadge";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/casos-de-exito", label: "Casos de éxito" },
  { href: "/contacto", label: "Contacto" },
];

export function BrandHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-bolg-border bg-bolg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/*
          Lockup "BØLG Corporativo" unificado en el header. Antes había wordmark
          + divisor + texto "Corporativo" separados — daba sensación de
          "subseccion". El lockup queda como marca propia coherente.
          width/height respetan la proporción original (~2:1) para evitar CLS.
        */}
        <Link href="/" aria-label="Volver al inicio" className="inline-flex items-center">
          <Image
            src="/brand/bolg-corporativo-lockup.png"
            alt="BØLG Corporativo"
            width={1902}
            height={936}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              className="whitespace-nowrap text-xs uppercase tracking-[0.18em] text-bolg-text/80 transition hover:text-bolg-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Badge del carrito de cotización: visible siempre que haya líneas. */}
          <QuoteBadge />
          {/* Desktop CTA: "Ver catálogo" más explícito que "Cotizar ahora". */}
          <Link
            href="/catalogo"
            className="hidden whitespace-nowrap rounded-bolg-button bg-bolg-button px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-bolg-button-text transition hover:opacity-90 md:inline-flex"
          >
            Ver catálogo
          </Link>
          {/* Mobile: hamburguesa abre drawer con nav + CTAs grandes. */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
