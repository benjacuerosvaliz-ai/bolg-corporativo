/**
 * Logo wall de clientes corporativos.
 *
 * Por ahora los nombres van en typography (uppercase tracking-wide) hasta que
 * Benja pase los SVG/PNG de cada marca con autorización formal. Cuando lleguen
 * los assets, reemplazar `name` por `<Image>` con el logo real manteniendo el
 * mismo grid + alturas.
 *
 * Source: clientes confirmados por Benja 2026-05-26, con permiso de uso.
 */
const CLIENTS = [
  { name: "Bayer", note: "Farmacéutica" },
  { name: "Astara", note: "Automotriz" },
  { name: "Monsanto", note: "Agroindustria" },
  { name: "Viña Ventisquero", note: "Vino" },
  { name: "Check Fast Cherry", note: "Fruta" },
  { name: "+ micro empresas", note: "PyMEs" },
] as const;

export function LogoWall() {
  return (
    <section className="border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-bolg-text/50">
          Empresas que confían en BØLG
        </p>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-bolg-card border border-bolg-border bg-bolg-border sm:grid-cols-3 lg:grid-cols-6">
          {CLIENTS.map((c) => (
            <div
              key={c.name}
              className="flex h-24 flex-col items-center justify-center bg-bolg-bg px-4 text-center"
            >
              <p className="font-bolg-heading text-sm uppercase tracking-[0.12em] text-bolg-text/85 sm:text-base">
                {c.name}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-bolg-text/40">
                {c.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
