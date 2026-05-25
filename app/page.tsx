import Link from "next/link";

/**
 * Landing placeholder Fase 0.
 *
 * La landing B2B aspiracional (hero video, pilares, logo wall, casos de éxito, FAQ)
 * se construye en Fase 1. Por ahora solo confirma que el layout, los tokens y las
 * fuentes están aplicándose correctamente.
 */
export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-6 py-24 lg:px-10">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        BOLG Corporativo
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-light leading-[1.1] sm:text-5xl lg:text-6xl">
        Regalos corporativos que tu equipo realmente va a usar.
      </h1>
      <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:text-lg">
        Cotiza mochilas, botellas y accesorios BOLG con tu logo. Precios por volumen,
        stock real en tiempo real y entrega garantizada para tu fecha.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
        >
          Ver catálogo corporativo
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center justify-center rounded-bolg-button border border-bolg-text px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
        >
          Hablar con un asesor
        </Link>
      </div>

      <p className="mt-16 max-w-xl text-xs uppercase tracking-[0.2em] text-bolg-text/40">
        Fase 0 · Setup. Landing completa, catálogo y configurador llegan en Fases 1-2.
      </p>
    </section>
  );
}
