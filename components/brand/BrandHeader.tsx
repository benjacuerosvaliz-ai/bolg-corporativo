import Link from "next/link";
import { Logo } from "./Logo";
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
        <Link href="/" aria-label="Volver al inicio" className="inline-flex items-center">
          <Logo className="h-6 w-auto" />
          <span className="ml-3 hidden border-l border-bolg-border pl-3 text-xs uppercase tracking-[0.18em] text-bolg-text/60 lg:inline">
            Corporativo
          </span>
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
