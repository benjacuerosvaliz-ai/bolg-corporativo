import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Hero rediseñado: el lockup BØLG Corporativo es el protagonista en el centro,
 * con la propuesta de valor textual en chico debajo. Las 4 categorías clickeables
 * pasan a ser una sección horizontal full-width debajo del CTA, ya no compiten
 * con el headline por atención.
 */
export function Hero() {
  return (
    <>
      {/* Hero centrado: lockup + propuesta + CTAs */}
      <section className="relative overflow-hidden border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center sm:py-24 lg:px-10 lg:py-32">
          {/*
            Lockup como protagonista del hero. Reemplaza el headline textual
            gigante. Va más alto en desktop (h-44) para que tenga presencia
            real — es la marca lo primero que comunica.
          */}
          <Image
            src="/brand/bolg-corporativo-lockup.png"
            alt="BØLG Corporativo"
            width={1902}
            height={936}
            priority
            className="h-28 w-auto sm:h-36 lg:h-44"
          />

          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:mt-6 sm:text-xs">
            Plataforma B2B · Chile
          </p>

          {/*
            Propuesta de valor textual: queda como H1 (necesario para SEO + a11y)
            pero más chico que antes (text-3xl vs text-7xl). El logo grande hace
            el trabajo visual; el H1 hace el trabajo conceptual.
          */}
          <h1 className="mt-6 max-w-3xl text-2xl font-light leading-[1.15] sm:mt-8 sm:text-3xl lg:text-4xl">
            Regalos corporativos que tu equipo realmente va a usar.
          </h1>

          <p className="mt-5 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:mt-6 sm:text-base">
            Mochilas, botellas y accesorios BØLG personalizados con tu logo.
            Precios por volumen, stock en tiempo real y preview de cómo se ve
            tu logo antes de aprobar.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
            >
              Ver catálogo y cotizar
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-bolg-button border border-bolg-text px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
            >
              Hablar con un asesor
            </Link>
          </div>

          <p className="mt-6 font-bolg-body text-xs normal-case tracking-normal text-bolg-text/50 sm:mt-8">
            49 productos elegibles · Mínimo 10 unidades · Despacho a todo Chile
          </p>
        </div>
      </section>

      {/*
        Categorías clickeables como sección propia debajo del hero.
        Grid 4 columnas en desktop (mochilas, botellas, accesorios, tu-logo),
        2 columnas en tablet, 1 columna en mobile. Cards altos para que cada
        uno tenga presencia real, no fritos como bandita al costado.
        TODO Benja: cuando haya fotos reales de cada categoría con logo
        aplicado, reemplazar el fondo plano por <Image fill> de cada una.
      */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            Categorías
          </p>
          <h2 className="mt-3 max-w-3xl font-bolg-heading text-xl font-light leading-[1.15] text-bolg-text sm:text-2xl lg:text-3xl">
            Explora por tipo de producto.
          </h2>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:mt-12">
            <Link
              href="/catalogo?category=Mochilas+y+Bolsos"
              className="group relative flex h-48 items-end overflow-hidden bg-bolg-image-bg-dark p-6 text-bolg-button-text transition hover:bg-bolg-text sm:h-56 lg:h-72"
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-80 transition group-hover:opacity-100">
                Mochilas y bolsos
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>

            <Link
              href="/catalogo?category=Botellas"
              className="group relative flex h-48 items-end overflow-hidden bg-bolg-image-bg-light p-6 transition hover:bg-bolg-image-bg-dark hover:text-bolg-button-text sm:h-56 lg:h-72"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-bolg-text/70 transition group-hover:text-bolg-button-text">
                Botellas
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>

            <Link
              href="/catalogo?category=Accesorios"
              className="group relative flex h-48 items-end overflow-hidden bg-bolg-image-bg-dark p-6 text-bolg-button-text transition hover:bg-bolg-text sm:h-56 lg:h-72"
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-80 transition group-hover:opacity-100">
                Accesorios
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>

            <Link
              href="/catalogo"
              className="group relative flex h-48 items-end justify-between overflow-hidden bg-bolg-text p-6 text-bolg-button-text transition hover:opacity-90 sm:h-56 lg:h-72"
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-80 transition group-hover:opacity-100">
                Tu logo aquí
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
              <Logo variant="inverted" className="h-5 w-auto opacity-80" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
