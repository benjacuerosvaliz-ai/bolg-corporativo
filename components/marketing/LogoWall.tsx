import Image from "next/image";

/**
 * Logo wall de clientes corporativos.
 *
 * Los 5 logos viven en /public/clients/*.png procesados con ImageMagick para
 * quitar fondo blanco/uniforme y recortar márgenes. Como son transparentes
 * reales, no necesitamos mix-blend-mode — el next/image + object-contain
 * dentro de un container de alto fijo normaliza la presentación.
 *
 * Source: clientes confirmados por Benja 2026-05-26, logos procesados localmente.
 */

const CLIENTS: readonly { slug: string; name: string }[] = [
  { slug: "bayer", name: "Bayer" },
  { slug: "astara", name: "Astara" },
  { slug: "monsanto", name: "Monsanto" },
  { slug: "ventisquero", name: "Viña Ventisquero" },
  { slug: "check-fast-cherry", name: "Check Fast Cherry" },
  { slug: "mypymes", name: "MyPYMES Chilenas" },
];

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
              key={c.slug}
              className="relative flex h-24 items-center justify-center bg-bolg-bg p-5"
            >
              <Image
                src={`/clients/${c.slug}.png`}
                alt={`Logo ${c.name}`}
                fill
                sizes="(min-width: 1024px) 200px, (min-width: 640px) 240px, 50vw"
                className="object-contain p-4"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
