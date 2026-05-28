/**
 * Helpers para descomponer títulos de producto BØLG.
 *
 * Convención de nombres en Shopify: "{Modelo} - {Color}".
 *   "Mug Insulado Portland 591 ml - Pale Mint"
 *     → model: "Mug Insulado Portland 591 ml", color: "Pale Mint"
 *
 * Cada color es un producto separado en Shopify (handle propio), así que para
 * mostrar "otros colores disponibles" agrupamos por `model`.
 */

export type TitleParts = {
  model: string;
  color: string | null;
};

/** Separa el título por el último " - ". Si no hay, color es null. */
export function splitModelColor(title: string): TitleParts {
  const idx = title.lastIndexOf(" - ");
  if (idx === -1) return { model: title.trim(), color: null };
  return {
    model: title.slice(0, idx).trim(),
    color: title.slice(idx + 3).trim(),
  };
}
