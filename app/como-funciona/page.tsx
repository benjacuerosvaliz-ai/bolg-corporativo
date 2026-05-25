import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo funciona",
};

/**
 * TODO Fase 7 (polish): página completa con timeline visual del proceso
 * (cotizar → aprobar → producir → despachar) + casos de uso por industria.
 */
export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        Cómo funciona
      </p>
      <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
        Del catálogo a la entrega en 4 pasos.
      </h1>
      <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
        Página en construcción. Por ahora puedes ir directo al{" "}
        <a href="/catalogo" className="underline underline-offset-4">
          catálogo corporativo
        </a>{" "}
        o{" "}
        <a href="/contacto" className="underline underline-offset-4">
          hablar con un asesor
        </a>
        .
      </p>
    </div>
  );
}
