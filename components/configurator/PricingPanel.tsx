"use client";

import { formatCLP } from "@/lib/utils/money";
import type { LinePricing } from "@/lib/quote/types";
import type { VolumeBreak } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  pricing: LinePricing;
  quantity: number;
  /** Tabla completa de breaks para mostrar el ladder. */
  volumePricing: VolumeBreak[];
  onJumpToQuantity?: (q: number) => void;
};

/**
 * Panel de pricing completo.
 *
 * Diferencias vs PricingPanelMini:
 *  - Tabla de breaks de volumen con el actual destacado, clickeable.
 *  - Callout más prominente del próximo break.
 *  - Desglose con jerarquía visual fuerte.
 *  - Badge de ahorro vs baseline destacado.
 */
export function PricingPanel({
  pricing,
  quantity,
  volumePricing,
  onJumpToQuantity,
}: Props) {
  const unitTotal = pricing.unitPriceNet + pricing.customizationUnitPrice;
  const sortedBreaks = [...volumePricing].sort((a, b) => a.minQty - b.minQty);

  return (
    <section className="rounded-bolg-card border border-bolg-border bg-bolg-image-bg-light p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
          Precio en vivo
        </p>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-bolg-heading text-4xl font-light tracking-tight text-bolg-text">
            {formatCLP(pricing.totalGross)}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-bolg-text/60">
            Total bruto
          </span>
        </div>
        <p className="mt-1 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
          {quantity} unidades · {formatCLP(pricing.subtotalNet)} neto + IVA
        </p>
      </header>

      {pricing.savingsVsBaseline > 0 && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-bolg-button bg-bolg-text px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bolg-button-text">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
          Ahorras {formatCLP(pricing.savingsVsBaseline)} vs precio base
        </div>
      )}

      {pricing.nextBreak && pricing.nextBreak.savings > 0 && (
        <button
          type="button"
          onClick={() => onJumpToQuantity?.(pricing.nextBreak!.minQty)}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-bolg-button border border-bolg-text bg-bolg-bg px-4 py-3 text-left transition hover:bg-bolg-text hover:text-bolg-button-text"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">
              Próximo break
            </span>
            <span className="text-xs uppercase tracking-[0.18em]">
              Sube a {pricing.nextBreak.minQty} unidades
            </span>
          </span>
          <span className="font-bolg-body text-sm tracking-normal">
            ahorras {formatCLP(pricing.nextBreak.savings)}
          </span>
        </button>
      )}

      <div className="mt-6 space-y-2 border-t border-bolg-border pt-5 font-bolg-body text-sm normal-case tracking-normal">
        <Row label={`Unitario neto (${quantity} u)`} value={formatCLP(unitTotal)} />
        <Row label="  Producto" value={formatCLP(pricing.unitPriceNet)} muted />
        <Row
          label="  Personalización"
          value={formatCLP(pricing.customizationUnitPrice)}
          muted
        />
        {pricing.setupFee > 0 && (
          <Row label="Setup (única vez)" value={formatCLP(pricing.setupFee)} />
        )}
        <Row label="Subtotal neto" value={formatCLP(pricing.subtotalNet)} />
        <Row label="IVA 19%" value={formatCLP(pricing.iva)} muted />
      </div>

      <div className="mt-6 border-t border-bolg-border pt-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
          Tabla de descuentos por volumen
        </p>
        <ul className="mt-3 space-y-1.5">
          {sortedBreaks.map((b) => {
            const isActive = b.minQty === pricing.appliedBreak.minQty;
            return (
              <li key={b.minQty}>
                <button
                  type="button"
                  onClick={() => onJumpToQuantity?.(b.minQty)}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-3 rounded-[3px] px-3 py-2 text-left transition",
                    isActive
                      ? "bg-bolg-text text-bolg-button-text"
                      : "bg-bolg-bg text-bolg-text/70 hover:bg-bolg-image-bg-dark hover:text-bolg-button-text",
                  )}
                >
                  <span className="text-xs uppercase tracking-[0.18em]">
                    {b.minQty}+ unidades
                  </span>
                  <span className="font-bolg-body text-sm tracking-normal">
                    {formatCLP(b.unitPriceNet)}{" "}
                    <span className="opacity-60">/u</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3 whitespace-pre",
        muted ? "text-bolg-text/55" : "text-bolg-text",
      )}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
