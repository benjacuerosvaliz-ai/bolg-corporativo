import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32 lg:px-10">
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            BØLG Corporativo · Plataforma B2B
          </p>
          <h1 className="mt-6 text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl">
            Regalos corporativos que tu equipo realmente va a usar.
          </h1>
          <p className="mt-8 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:text-lg">
            Cotiza mochilas, botellas y accesorios BØLG personalizados con tu logo.
            Precios por volumen, stock en tiempo real, timeline garantizado y un
            preview de cómo se ve tu logo sobre cada producto antes de aprobar.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
            >
              Cotizar ahora
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-bolg-button border border-bolg-text px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>

        {/*
          TODO Benja: foto hero. Mientras tanto, mosaico tipográfico de productos
          con tratamiento BOLG. Reemplazar con foto real cuando esté lista
          (mochila BOLG con logo corporativo en contexto premium).
        */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="grid h-full grid-cols-2 grid-rows-3 gap-2">
            <div className="col-span-2 flex items-end bg-bolg-image-bg-dark p-6 text-bolg-button-text">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                Mochila urbana
              </p>
            </div>
            <div className="flex items-end bg-bolg-image-bg-light p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/70">
                Botella acero
              </p>
            </div>
            <div className="flex items-end bg-bolg-image-bg-dark p-6 text-bolg-button-text">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                Vestuario
              </p>
            </div>
            <div className="col-span-2 flex items-end justify-between bg-bolg-text p-6 text-bolg-button-text">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                Tu logo aquí
              </p>
              <Logo variant="inverted" className="h-5 w-auto opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
