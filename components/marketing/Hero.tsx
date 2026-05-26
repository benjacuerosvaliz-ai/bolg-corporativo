import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-32 lg:px-10">
        <div className="lg:col-span-7">
          <p className="text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:text-xs">
            BØLG Corporativo · Plataforma B2B
          </p>
          {/*
            Headline más compacto en mobile (text-3xl) para que los CTAs queden
            arriba del fold sin scroll. En desktop mantiene la presencia editorial.
          */}
          <h1 className="mt-4 text-3xl font-light leading-[1.05] sm:mt-6 sm:text-5xl lg:text-6xl xl:text-7xl">
            Regalos corporativos que tu equipo realmente va a usar.
          </h1>
          <p className="mt-5 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:mt-8 sm:text-lg">
            Mochilas, botellas y accesorios BØLG personalizados con tu logo.
            Precios por volumen, stock en tiempo real y preview de cómo se ve
            tu logo antes de aprobar.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            {/*
              CTA primario reescrito: "Ver catálogo" comunica explícitamente
              que hay productos navegables. "Cotizar ahora" sugería iniciar
              proceso sin entender qué iba a aparecer.
            */}
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

        {/*
          Mosaico de categorías clickeables. Cada bloque lleva a /catalogo
          filtrado por su categoría — funciona como navegación visual para
          que el usuario pueda saltar directo desde el Hero a la categoría
          que le interesa. El último bloque ("Tu logo aquí") es CTA al
          catálogo completo, reforzando el concepto de personalización.
          TODO Benja: cuando haya fotos reales de cada categoría con logo
          aplicado, reemplazar el fondo plano por <Image fill> de cada una.
        */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="grid h-full grid-cols-2 grid-rows-3 gap-2">
            <Link
              href="/catalogo?category=Mochilas+y+Bolsos"
              className="group col-span-2 flex items-end bg-bolg-image-bg-dark p-6 text-bolg-button-text transition hover:bg-bolg-text"
            >
              <p className="text-xs uppercase tracking-[0.25em] opacity-80 transition group-hover:opacity-100">
                Mochilas y bolsos
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>
            <Link
              href="/catalogo?category=Botellas"
              className="group flex items-end bg-bolg-image-bg-light p-6 transition hover:bg-bolg-image-bg-dark hover:text-bolg-button-text"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/70 transition group-hover:text-bolg-button-text">
                Botellas
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>
            <Link
              href="/catalogo?category=Accesorios"
              className="group flex items-end bg-bolg-image-bg-dark p-6 text-bolg-button-text transition hover:bg-bolg-text"
            >
              <p className="text-xs uppercase tracking-[0.25em] opacity-80 transition group-hover:opacity-100">
                Accesorios
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
            </Link>
            <Link
              href="/catalogo"
              className="group col-span-2 flex items-end justify-between bg-bolg-text p-6 text-bolg-button-text transition hover:opacity-90"
            >
              <p className="text-xs uppercase tracking-[0.25em] opacity-80 transition group-hover:opacity-100">
                Tu logo aquí
                <span aria-hidden className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </p>
              <Logo variant="inverted" className="h-5 w-auto opacity-80" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
