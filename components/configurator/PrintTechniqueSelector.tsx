"use client";

import { useEffect, useState } from "react";
import type { PrintTechnique } from "@/lib/shopify/types";
import { formatCLP } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import {
  findTechniqueDetail,
  type TechniqueDetail,
} from "@/lib/brand/print-techniques-info";

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

  const [openTechnique, setOpenTechnique] = useState<{
    id: string;
    label: string;
    description: string;
  } | null>(null);

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
            <div
              key={t.id}
              className={cn(
                "rounded-bolg-button border transition",
                isActive
                  ? "border-bolg-text bg-bolg-image-bg-light"
                  : "border-bolg-border bg-bolg-bg hover:border-bolg-text",
              )}
            >
              <div className="flex items-stretch gap-1 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onChange(t.id)}
                  className="flex flex-1 flex-col gap-2 text-left"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-bolg-text">
                      {t.label}
                    </span>
                    <span className="font-bolg-body text-xs tracking-normal text-bolg-text">
                      +{formatCLP(t.basePriceUnit)}{" "}
                      <span className="text-bolg-text/50">/u</span>
                    </span>
                  </div>
                  <p className="font-bolg-body text-xs normal-case tracking-normal text-bolg-text/65">
                    {t.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
                    {t.setupFee > 0 && (
                      <span>Setup {formatCLP(t.setupFee)}</span>
                    )}
                    {t.extraLeadDays > 0 && (
                      <span>+{t.extraLeadDays}d producción</span>
                    )}
                    {t.extraPositionPrice > 0 && (
                      <span>
                        +{formatCLP(t.extraPositionPrice)}/u zona extra
                      </span>
                    )}
                  </div>
                </button>

                {/* Botón "?" abre modal con info detallada de la técnica */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTechnique({
                      id: t.id,
                      label: t.label,
                      description: t.description,
                    });
                  }}
                  aria-label={`Más información sobre ${t.label}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full border border-bolg-text/30 text-[11px] font-bolg-heading text-bolg-text/60 transition hover:border-bolg-text hover:text-bolg-text"
                >
                  ?
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {openTechnique && (
        <TechniqueInfoModal
          technique={openTechnique}
          onClose={() => setOpenTechnique(null)}
        />
      )}
    </div>
  );
}

function TechniqueInfoModal({
  technique,
  onClose,
}: {
  technique: { id: string; label: string; description: string };
  onClose: () => void;
}) {
  // Buscamos info enriquecida por id o label. Si no hay match en el catálogo
  // hardcodeado, caemos al description que viene del producto Shopify.
  const detail: TechniqueDetail | null =
    findTechniqueDetail(technique.id) || findTechniqueDetail(technique.label);

  // Lock scroll + escape para cerrar.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${technique.label}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute inset-0 bg-bolg-text/50 backdrop-blur-sm"
      />

      <div className="relative isolate max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-bolg-card bg-bolg-bg shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-bolg-border px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/55">
              Técnica de impresión
            </p>
            <h3 className="mt-2 font-bolg-heading text-xl uppercase tracking-[0.08em] text-bolg-text sm:text-2xl">
              {detail?.headline ?? technique.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-bolg-button text-bolg-text hover:bg-bolg-image-bg-light"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </header>

        <div className="space-y-6 px-6 py-6">
          {/* TODO: cuando lleguen fotos de muestras reales, mostrar acá la
              imagen del logo aplicado con cada técnica. Por ahora omitimos. */}
          {detail?.imageUrl && (
            <div className="overflow-hidden border border-bolg-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL dinámica del data file, sin domain whitelist de next/image todavía */}
              <img
                src={detail.imageUrl}
                alt={`Ejemplo de ${detail.headline}`}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          )}

          <p className="font-bolg-body text-sm normal-case tracking-normal text-bolg-text/80 sm:text-base">
            {detail?.description ?? technique.description}
          </p>

          {detail && (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/55">
                  Características
                </p>
                <ul className="mt-3 space-y-2">
                  {detail.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/80"
                    >
                      <span
                        aria-hidden
                        className="mt-[6px] inline-block h-1 w-3 flex-shrink-0 bg-bolg-text/50"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/55">
                  Ideal para
                </p>
                <p className="mt-2 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/80">
                  {detail.bestFor}
                </p>
              </div>

              {detail.limitations && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/55">
                    Limitaciones
                  </p>
                  <p className="mt-2 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/65">
                    {detail.limitations}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="border-t border-bolg-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-bolg-button bg-bolg-button px-6 py-3 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
          >
            Entendido
          </button>
        </footer>
      </div>
    </div>
  );
}
