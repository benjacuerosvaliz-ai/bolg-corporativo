import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizador",
};

/** Stub. Implementación completa en Fase 3. */
export default function CotizadorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        Cotizador
      </p>
      <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl">
        Tu cotización en construcción.
      </h1>
      <p className="mt-6 font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
        Esta pantalla muestra tu cotización multi-producto. Llega en Fase 3.
        Mientras tanto, arma tu cotización desde una{" "}
        <a href="/catalogo" className="underline underline-offset-4">
          ficha del catálogo
        </a>
        .
      </p>
    </div>
  );
}
