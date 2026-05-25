"use client";

import type { PrintTechnique } from "@/lib/shopify/types";
import { formatCLP } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

type Props = {
  techniques: PrintTechnique[];
  selectedId: string;
  onChange: (techniqueId: string) => void;
  /** ID de la zona seleccionada para filtrar técnicas compatibles. */
  availableForAreaId: string;
};

export function PrintTechniqueSelector({
  techniques,
  selectedId,
  onChange,
  availableForAreaId,
}: Props) {
  const compatible = techniques.filter((t) =>
    t.availableAreaIds.includes(availableForAreaId),
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h4 className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
          Técnica de impresión
        </h4>
        {compatible.length === 0 && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-bolg-error">
            Sin opciones para esta zona
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {compatible.map((t) => {
          const isActive = t.id === selectedId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "flex w-full flex-col gap-2 rounded-bolg-button border px-4 py-3 text-left transition",
                isActive
                  ? "border-bolg-text bg-bolg-image-bg-light"
                  : "border-bolg-border bg-bolg-bg hover:border-bolg-text",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-bolg-text">
                  {t.label}
                </span>
                <span className="font-bolg-body text-xs tracking-normal text-bolg-text">
                  +{formatCLP(t.basePriceUnit)} <span className="text-bolg-text/50">/u</span>
                </span>
              </div>
              <p className="font-bolg-body text-xs normal-case tracking-normal text-bolg-text/65">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
                {t.setupFee > 0 && <span>Setup {formatCLP(t.setupFee)}</span>}
                {t.extraLeadDays > 0 && <span>+{t.extraLeadDays}d producción</span>}
                {t.extraPositionPrice > 0 && (
                  <span>+{formatCLP(t.extraPositionPrice)}/u zona extra</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
