/**
 * Métricas de track record.
 *
 * TODO Benja: confirmar números reales (unidades entregadas, empresas,
 * tasa de recompra, antigüedad). Por ahora son "—" para no inventar.
 * Cuando tengas los números los reemplazas en METRICS.
 */
const METRICS = [
  { value: "—", label: "Unidades entregadas" },
  { value: "—", label: "Empresas atendidas" },
  { value: "—", label: "Tasa de recompra" },
  { value: "—", label: "Años en el mercado" },
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
