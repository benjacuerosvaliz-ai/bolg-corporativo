import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type ColorOption = {
  handle: string;
  /** Nombre del color (ej. "Pale Mint"). */
  color: string;
  imageUrl: string;
  isCurrent: boolean;
};

/**
 * Swatches de color: thumbnails circulares de cada color disponible del mismo
 * modelo. El actual queda destacado con un anillo; los demás son links a su
 * PDP para saltar entre colores sin volver al catálogo.
 *
 * Server-friendly: sólo Image + Link, sin estado. Se renderiza si hay 2+
 * opciones (sino no tiene sentido mostrarlo).
 */
export function ColorSwatches({ options }: { options: ColorOption[] }) {
  if (options.length < 2) return null;

  const current = options.find((o) => o.isCurrent);

  return (
    <div className="mt-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/55">
        Color{current?.color ? `: ${current.color}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((opt) =>
          opt.isCurrent ? (
            <span
              key={opt.handle}
              aria-current="true"
              title={opt.color}
              className="relative h-12 w-12 overflow-hidden rounded-full bg-bolg-image-bg-light ring-2 ring-bolg-text ring-offset-2 ring-offset-bolg-bg"
            >
              <Image
                src={opt.imageUrl}
                alt={opt.color}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </span>
          ) : (
            <Link
              key={opt.handle}
              href={`/catalogo/${opt.handle}` as never}
              title={opt.color}
              aria-label={`Ver en color ${opt.color}`}
              className="relative h-12 w-12 overflow-hidden rounded-full bg-bolg-image-bg-light ring-1 ring-bolg-border transition hover:ring-2 hover:ring-bolg-text"
            >
              <Image
                src={opt.imageUrl}
                alt={opt.color}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
