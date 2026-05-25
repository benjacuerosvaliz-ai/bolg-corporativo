"use client";

import { useMemo, useState } from "react";
import type { CorporateProduct } from "@/lib/shopify/types";
import { calculateLinePricing } from "@/lib/quote/pricing";
import { VariantSelector } from "./VariantSelector";
import { PrintAreaSelector } from "./PrintAreaSelector";
import { PrintTechniqueSelector } from "./PrintTechniqueSelector";
import { QuantityStepper } from "./QuantityStepper";
import { TimelineSelector } from "./TimelineSelector";
import { PricingPanelMini } from "./PricingPanelMini";

type Props = {
  product: CorporateProduct;
};

function defaultRequiredDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

export function ProductConfigurator({ product }: Props) {
  const firstVariant = product.variants[0];
  const firstArea = product.printAreas[0];
  const firstTechnique = product.printTechniques[0];

  const [variantId, setVariantId] = useState<string>(firstVariant?.id ?? "");
  const [areaId, setAreaId] = useState<string>(firstArea?.id ?? "");
  const [techniqueId, setTechniqueId] = useState<string>(firstTechnique?.id ?? "");
  const [quantity, setQuantity] = useState<number>(product.minQty);
  const [requiredDate, setRequiredDate] = useState<string>(defaultRequiredDateIso());
  const [occasion, setOccasion] = useState<string | null>(null);

  // Si la zona cambia y la técnica actual no es compatible, ajusta a la primera compatible.
  const activeTechnique = useMemo(() => {
    const compatible = product.printTechniques.filter((t) =>
      t.availableAreaIds.includes(areaId),
    );
    const current = compatible.find((t) => t.id === techniqueId);
    return current ?? compatible[0] ?? null;
  }, [product.printTechniques, areaId, techniqueId]);

  const pricing = useMemo(() => {
    if (!activeTechnique) return null;
    try {
      return calculateLinePricing({
        product,
        quantity,
        technique: activeTechnique,
        printPositions: 1,
      });
    } catch {
      return null;
    }
  }, [product, quantity, activeTechnique]);

  return (
    <div className="space-y-10">
      {product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selectedId={variantId}
          onChange={setVariantId}
        />
      )}

      {product.printAreas.length > 0 && (
        <PrintAreaSelector
          areas={product.printAreas}
          selectedId={areaId}
          onChange={setAreaId}
        />
      )}

      {activeTechnique && (
        <PrintTechniqueSelector
          techniques={product.printTechniques}
          selectedId={activeTechnique.id}
          onChange={setTechniqueId}
          availableForAreaId={areaId}
        />
      )}

      <QuantityStepper
        value={quantity}
        minQty={product.minQty}
        onChange={setQuantity}
        nextBreak={pricing?.nextBreak ?? null}
      />

      <TimelineSelector
        value={requiredDate}
        onChange={setRequiredDate}
        occasion={occasion}
        onOccasionChange={setOccasion}
      />

      {pricing && <PricingPanelMini pricing={pricing} quantity={quantity} />}

      <button
        type="button"
        disabled
        className="w-full rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text opacity-60"
        title="Disponible en Fase 2e"
      >
        Agregar a cotización (Fase 2e)
      </button>
    </div>
  );
}
