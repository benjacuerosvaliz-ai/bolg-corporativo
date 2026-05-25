/**
 * Logo wall de clientes corporativos.
 *
 * TODO Benja: agregar logos reales de empresas que ya hayan comprado.
 * Por ahora son slots vacíos con label genérico — se ven elegantes y
 * claramente "por completar" sin inventar marcas que no existen.
 */
const SLOTS = [
  "Cliente 01",
  "Cliente 02",
  "Cliente 03",
  "Cliente 04",
  "Cliente 05",
  "Cliente 06",
] as const;

export function LogoWall() {
  return (
    <section className="border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-bolg-text/50">
          Empresas que confían en BØLG
        </p>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-bolg-card border border-bolg-border bg-bolg-border sm:grid-cols-3 lg:grid-cols-6">
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className="flex h-24 items-center justify-center bg-bolg-bg text-xs uppercase tracking-[0.25em] text-bolg-text/30"
            >
              {slot}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
