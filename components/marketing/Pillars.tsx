const PILLARS = [
  {
    n: "01",
    title: "Cotización instantánea",
    body: "Configura cantidad, técnica de impresión y zona del logo. Ves el precio unitario, el ahorro por volumen y el total con IVA en tiempo real.",
  },
  {
    n: "02",
    title: "Stock real + re-order programado",
    body: "Consultamos el inventario directo desde Shopify. Si necesitas más unidades que el stock listo, calculamos la reposición desde origen y validamos que llegue a tu fecha.",
  },
  {
    n: "03",
    title: "Preview del logo sobre cada producto",
    body: "Sube tu logo y velo aplicado sobre el producto antes de aprobar. Calculamos el tamaño en centímetros reales sobre la zona de impresión.",
  },
] as const;

export function Pillars() {
  return (
    <section className="border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
          Cómo trabajamos
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-light leading-[1.1] sm:text-4xl">
          Una sola herramienta para todo el ciclo de compra corporativa.
        </h2>

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {PILLARS.map((p) => (
            <div key={p.n} className="flex flex-col gap-4 border-t border-bolg-text pt-6">
              <span className="font-bolg-heading text-xs uppercase tracking-[0.25em] text-bolg-text/50">
                {p.n}
              </span>
              <h3 className="text-xl font-light leading-tight sm:text-2xl">
                {p.title}
              </h3>
              <p className="font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
