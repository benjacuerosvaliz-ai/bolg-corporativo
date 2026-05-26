/**
 * Métricas de track record. Cifras confirmadas con Benja 2026-05-26.
 * Usamos "+" para sugerir crecimiento sin comprometer el número exacto.
 */
const METRICS = [
  { value: "+1.000", label: "Unidades entregadas" },
  { value: "+30", label: "Empresas atendidas" },
  { value: "30%", label: "Tasa de recompra" },
  { value: "+3", label: "Años en el mercado" },
] as const;

export function SuccessMetrics() {
  return (
    <section className="border-b border-bolg-border bg-bolg-announcement text-bolg-button-text">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="text-xs uppercase tracking-[0.25em] opacity-60">
          Track record
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-light leading-[1.1] sm:text-4xl">
          Cifras que respaldan cada cotización.
        </h2>

        <dl className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="border-t border-white/20 pt-6">
              <dd className="font-bolg-heading text-4xl font-light leading-none sm:text-5xl">
                {m.value}
              </dd>
              <dt className="mt-3 text-xs uppercase tracking-[0.25em] opacity-70">
                {m.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
