import Image from "next/image";

/**
 * Logo wall de clientes corporativos.
 *
 * Cada logo va con next/image + fill + object-contain dentro de un container
 * de alto fijo. Eso normaliza visualmente logos de proporciones distintas
 * (Bayer ~cuadrado, Astara ~ancho) sin distorsionar.
 *
 * Los JPG (Astara) y los PNG con fondo blanco se neutralizan visualmente con
 * `mix-blend-mode: multiply`: blanco × cualquier color = el color de abajo,
 * así el fondo blanco se vuelve "invisible" sobre el bg crema del slot.
 * Funciona cuando el logo es oscuro sobre fondo claro (caso de todos los
 * actuales). Si en el futuro entra un logo blanco sobre fondo oscuro, hacemos
 * excepción con una flag `darkLogo`.
 *
 * Source: clientes confirmados por Benja 2026-05-26.
 */

type Client = {
  /** Slug del archivo en /public/clients/ */
  slug: string;
  ext: "png" | "jpg" | "webp";
  /** Nombre legible para alt text + fallback */
  name: string;
};

const CLIENTS: readonly Client[] = [
  { slug: "bayer", ext: "png", name: "Bayer" },
  { slug: "astara", ext: "jpg", name: "Astara" },
  { slug: "monsanto", ext: "png", name: "Monsanto" },
  { slug: "ventisquero", ext: "webp", name: "Viña Ventisquero" },
  { slug: "check-fast-cherry", ext: "png", name: "Check Fast Cherry" },
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
                src={`/clients/${c.slug}.${c.ext}`}
                alt={`Logo ${c.name}`}
                fill
                sizes="(min-width: 1024px) 200px, (min-width: 640px) 240px, 50vw"
                className="object-contain p-4 mix-blend-multiply"
              />
            </div>
          ))}
          {/* Sexta celda: tile decorativo en negro como CTA "y más" */}
          <div className="flex h-24 items-center justify-center bg-bolg-text px-4 text-center">
            <p className="font-bolg-heading text-xs uppercase tracking-[0.18em] text-bolg-button-text/85 sm:text-sm">
              + micro empresas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
