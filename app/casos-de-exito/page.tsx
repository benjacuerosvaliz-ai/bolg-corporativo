import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casos de éxito",
};

/**
 * TODO Benja: pasar 3-5 casos reales con foto del producto + métrica
 * + testimonio breve. Hasta entonces, esta página queda como stub
 * elegante con CTAs hacia catálogo/contacto.
 */
export default function CasosDeExitoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        Casos de éxito
      </p>
      <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
        Empresas que confían en BØLG para sus regalos corporativos.
      </h1>
      <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
        Estamos curando los casos para esta sección. Mientras tanto puedes
        explorar el{" "}
        <a href="/catalogo" className="underline underline-offset-4">
          catálogo
        </a>{" "}
        o pedirnos referencias específicas para tu industria por{" "}
        <a href="/contacto" className="underline underline-offset-4">
          contacto directo
        </a>
        .
      </p>
    </div>
  );
}
