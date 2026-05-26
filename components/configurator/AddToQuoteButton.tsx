"use client";

import { useState } from "react";
import Link from "next/link";
import type { CorporateProduct, PrintArea, PrintTechnique, ProductVariant } from "@/lib/shopify/types";
import type { LinePricing } from "@/lib/quote/types";
import { addLine } from "@/lib/quote/storage";
import { formatCLP } from "@/lib/utils/money";

type Props = {
  product: CorporateProduct;
  variant: ProductVariant | null;
  technique: PrintTechnique | null;
  area: PrintArea | null;
  quantity: number;
  requiredDate: string;
  occasion: string | null;
  pricing: LinePricing | null;
  /** Estado del logo no se persiste todavía. Cuando tengamos Vercel Blob
      (Fase 4), guardamos la URL y los logoTransforms. */
};

type State = "idle" | "adding" | "added";

export function AddToQuoteButton({
  product,
  variant,
  technique,
  area,
  quantity,
  requiredDate,
  occasion,
  pricing,
}: Props) {
  const [state, setState] = useState<State>("idle");

  const disabled =
    !variant ||
    !technique ||
    !area ||
    !pricing ||
    quantity < product.minQty ||
    state === "adding";

  const handle = () => {
    if (disabled || !variant || !technique || !area || !pricing) return;
    setState("adding");
    try {
      addLine({
        productId: product.id,
        productHandle: product.handle,
        productTitle: product.title,
        productImageUrl: product.featuredImage.url,
        productCategory: product.category,
        variantId: variant.id,
        variantTitle: variant.title,
        quantity,
        techniqueId: technique.id,
        techniqueLabel: technique.label,
        areaId: area.id,
        areaLabel: area.label,
        requiredDate,
        occasion,
        pricing,
      });
      setState("added");
      // Reset el botón al estado idle después de un momento para que el
      // cliente pueda agregar el mismo producto con otra config si quiere.
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      console.error("[AddToQuoteButton] error:", err);
      setState("idle");
    }
  };

  if (state === "added") {
    return (
      <div className="space-y-2">
        <div className="flex w-full items-center justify-between gap-3 rounded-bolg-button border border-bolg-text bg-bolg-text px-6 py-4 text-bolg-button-text">
          <span className="text-xs uppercase tracking-[0.2em]">
            ✓ Agregado a tu cotización
          </span>
          {pricing && (
            <span className="font-bolg-body text-xs tracking-normal opacity-80">
              {formatCLP(pricing.totalGross)}
            </span>
          )}
        </div>
        <Link
          href="/cotizador"
          className="flex w-full items-center justify-center gap-2 rounded-bolg-button border border-bolg-text px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
        >
          Ver cotización
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-bolg-button bg-bolg-button px-6 py-4 text-bolg-button-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="text-xs uppercase tracking-[0.2em]">
        {state === "adding" ? "Agregando…" : "Agregar a cotización"}
      </span>
      {pricing && (
        <span className="font-bolg-body text-xs tracking-normal opacity-90">
          {formatCLP(pricing.totalGross)}
        </span>
      )}
    </button>
  );
}
