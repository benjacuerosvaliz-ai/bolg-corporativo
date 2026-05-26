"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { CatalogSearchParams } from "./CatalogFilters";

type Props = {
  active: CatalogSearchParams;
  totalProducts: number;
  filteredCount: number;
  children: ReactNode;
};

/**
 * Wrapper colapsable para mobile. En desktop (lg+), los filtros se renderizan
 * siempre visibles en el sidebar sticky desde la página. Este componente solo
 * existe para la versión mobile/tablet.
 *
 * Muestra un botón "Filtros (n activos)" que toggle un panel con los filtros.
 * Si hay filtros activos, los muestra como chips deletables encima del botón
 * para que se entienda qué está aplicado sin necesidad de abrir el panel.
 */
export function CatalogFiltersMobile({
  active,
  totalProducts,
  filteredCount,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  const activeCount =
    (active.category ? 1 : 0) +
    (active.technique ? 1 : 0) +
    (active.inStock ? 1 : 0) +
    (active.sort && active.sort !== "relevance" ? 1 : 0);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-bolg-button border border-bolg-border bg-bolg-bg px-4 py-3 text-left transition",
          open && "border-bolg-text",
        )}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
            <path d="M0 1h14M2 6h10M5 11h4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-xs uppercase tracking-[0.2em] text-bolg-text">
            Filtros
          </span>
          {activeCount > 0 && (
            <span className="rounded-full bg-bolg-text px-2 py-0.5 text-[10px] font-medium text-bolg-button-text">
              {activeCount}
            </span>
          )}
        </span>
        <span className="font-bolg-body text-xs tracking-normal text-bolg-text/60">
          {filteredCount} de {totalProducts}
        </span>
      </button>

      {open && (
        <div className="mt-4 rounded-bolg-card border border-bolg-border bg-bolg-bg p-5">
          {children}
        </div>
      )}
    </div>
  );
}
