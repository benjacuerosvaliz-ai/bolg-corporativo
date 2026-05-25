"use client";

import type { ProductVariant } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  variants: ProductVariant[];
  selectedId: string;
  onChange: (variantId: string) => void;
};

/**
 * Selector de variantes (color, talla, etc.) agrupado por opción.
 * Cuando hay una sola opción (ej. solo "Color"), muestra swatches horizontales.
 * Cuando hay varias (ej. "Color" + "Talla"), agrupa por opción.
 */
export function VariantSelector({ variants, selectedId, onChange }: Props) {
  const selected = variants.find((v) => v.id === selectedId);
  if (!selected) return null;

  const optionNames = Array.from(
    new Set(variants.flatMap((v) => v.selectedOptions.map((o) => o.name))),
  );

  return (
    <div className="space-y-6">
      {optionNames.map((optName) => {
        const values = Array.from(
          new Set(
            variants
              .map((v) => v.selectedOptions.find((o) => o.name === optName)?.value)
              .filter((x): x is string => Boolean(x)),
          ),
        );
        const selectedValue = selected.selectedOptions.find(
          (o) => o.name === optName,
        )?.value;

        return (
          <div key={optName}>
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
                {optName}
              </h4>
              <span className="font-bolg-body text-sm normal-case tracking-normal text-bolg-text">
                {selectedValue ?? "—"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {values.map((value) => {
                const candidate = variants.find((v) =>
                  v.selectedOptions.some(
                    (o) => o.name === optName && o.value === value,
                  ),
                );
                const isActive = value === selectedValue;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => candidate && onChange(candidate.id)}
                    className={cn(
                      "rounded-bolg-button border px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                      isActive
                        ? "border-bolg-text bg-bolg-text text-bolg-button-text"
                        : "border-bolg-border bg-bolg-bg text-bolg-text hover:border-bolg-text",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
