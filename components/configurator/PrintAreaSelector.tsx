"use client";

import type { PrintArea } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  areas: PrintArea[];
  selectedId: string;
  onChange: (areaId: string) => void;
};

export function PrintAreaSelector({ areas, selectedId, onChange }: Props) {
  // Una sola zona → no hay nada que elegir, la seleccionamos por default
  // y escondemos el selector para no aturdir al cliente.
  if (areas.length <= 1) return null;

  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
        Zona de impresión
      </h4>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {areas.map((area) => {
          const isActive = area.id === selectedId;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onChange(area.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-bolg-button border px-4 py-3 text-left transition",
                isActive
                  ? "border-bolg-text bg-bolg-text text-bolg-button-text"
                  : "border-bolg-border bg-bolg-bg text-bolg-text hover:border-bolg-text",
              )}
            >
              <span className="text-xs uppercase tracking-[0.18em]">
                {area.label}
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-normal normal-case",
                  isActive ? "opacity-70" : "text-bolg-text/50",
                )}
              >
                máx {area.maxWidthCm} × {area.maxHeightCm} cm
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
