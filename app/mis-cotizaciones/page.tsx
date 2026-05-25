import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis cotizaciones",
};

/** Stub. Implementación con magic link en Fase 5. */
export default function MisCotizacionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        Mis cotizaciones
      </p>
      <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl">
        Tu historial de cotizaciones.
      </h1>
      <p className="mt-6 font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
        Aquí verás todas tus cotizaciones con su estado y podrás re-cotizar
        en un click. Activamos esta sección en Fase 5.
      </p>
    </div>
  );
}
