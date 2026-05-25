"use client";

import { formatCLP } from "@/lib/utils/money";
import type { LinePricing } from "@/lib/quote/types";

type Props = {
  pricing: LinePricing;
  quantity: number;
};

/**
 * Versión mini del PricingPanel. La versión completa con desglose,
 * comparativas y gráfico llega en Fase 2c.
 */
export function PricingPanelMini({ pricing, quantity }: Props) {
  const unitTotal = pricing.unitPriceNet + pricing.customizationUnitPrice;
  return (
    <div className="rounded-bolg-card border border-bolg-border bg-bolg-image-bg-light p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
        Precio en vivo
      </p>

      <dl className="mt-5 space-y-3 font-bolg-body text-sm normal-case tracking-normal">
        <Row label="Unitario neto" value={formatCLP(unitTotal)} muted />
        {pricing.setupFee > 0 && (
          <Row label="Setup (única vez)" value={formatCLP(pricing.setupFee)} muted />
        )}
        <Row label={`Subtotal neto (${quantity} u)`} value={formatCLP(pricing.subtotalNet)} muted />
        <Row label="IVA 19%" value={formatCLP(pricing.iva)} muted />
        <div className="my-3 border-t border-bolg-border" />
        <Row label="Total bruto" value={formatCLP(pricing.totalGross)} emphasis />
      </dl>

      {pricing.savingsVsBaseline > 0 && (
        <p className="mt-5 inline-block rounded-bolg-button bg-bolg-text px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bolg-button-text">
          Ahorras {formatCLP(pricing.savingsVsBaseline)} por volumen
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt
        className={
          muted
            ? "text-bolg-text/65"
            : emphasis
              ? "text-xs uppercase tracking-[0.2em] text-bolg-text"
              : "text-bolg-text"
        }
      >
        {label}
      </dt>
      <dd
        className={
          emphasis
            ? "font-bolg-heading text-2xl font-light text-bolg-text"
            : "text-bolg-text"
        }
      >
        {value}
      </dd>
    </div>
  );
}
