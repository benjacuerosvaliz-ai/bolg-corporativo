import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  /** Variante: "default" en oscuro sobre fondo claro, "inverted" en blanco sobre fondo oscuro. */
  variant?: "default" | "inverted";
};

/**
 * Logo BOLG (wordmark).
 *
 * El theme actual de bolg.cl usa logo text-only (favicon = Isotipo_Negro_sin_Fondo).
 * TODO: reemplazar con SVG oficial cuando Benja pase el archivo vectorial.
 */
export function Logo({ className, variant = "default" }: Props) {
  const color = variant === "inverted" ? "text-bolg-button-text" : "text-bolg-text";
  return (
    <span
      className={cn(
        "font-bolg-heading text-2xl font-light uppercase tracking-[0.18em]",
        color,
        className,
      )}
    >
      BOLG
    </span>
  );
}
