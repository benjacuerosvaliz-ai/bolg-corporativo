"use client";

import { useMemo, useState } from "react";
import type { CorporateProduct } from "@/lib/shopify/types";
import { calculateLinePricing } from "@/lib/quote/pricing";
import { analyzeStock } from "@/lib/quote/stock-analysis";
import { VariantSelector } from "./VariantSelector";
import { PrintAreaSelector } from "./PrintAreaSelector";
import { PrintTechniqueSelector } from "./PrintTechniqueSelector";
import { QuantityStepper } from "./QuantityStepper";
import { TimelineSelector } from "./TimelineSelector";
import { PricingPanel } from "./PricingPanel";
import { StockAnalysis } from "./StockAnalysis";
import { LogoUploader } from "./LogoUploader";
import { LivePreview } from "./LivePreview";

type Props = {
  product: CorporateProduct;
  inventoryByVariantId: Record<string, number>;
};

function defaultRequiredDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

export function ProductConfigurator({ product, inventoryByVariantId }: Props) {
  const firstVariant = product.variants[0];
  const firstArea = product.printAreas[0];
  const firstTechnique = product.printTechniques[0];

  const [variantId, setVariantId] = useState<string>(firstVariant?.id ?? "");
  const [areaId, setAreaId] = useState<string>(firstArea?.id ?? "");
  const [techniqueId, setTechniqueId] = useState<string>(firstTechnique?.id ?? "");
  const [quantity, setQuantity] = useState<number>(product.minQty);
  const [requiredDate, setRequiredDate] = useState<string>(defaultRequiredDateIso());
  const [occasion, setOccasion] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? firstVariant ?? null,
    [product.variants, variantId, firstVariant],
  );

  const selectedArea = useMemo(
    () => product.printAreas.find((a) => a.id === areaId) ?? firstArea ?? null,
    [product.printAreas, areaId, firstArea],
  );

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

  const stockAnalysis = useMemo(() => {
    if (!activeTechnique) return null;
    const inventoryAvailable = inventoryByVariantId[variantId] ?? 0;
    try {
      return analyzeStock({
        inventoryAvailable,
        requiredQuantity: quantity,
        requiredDate: new Date(requiredDate),
        leadTimeDaysReorder: product.leadTimeDaysReorder,
        personalizationDays: activeTechnique.extraLeadDays,
      });
    } catch {
      return null;
    }
  }, [
    activeTechnique,
    inventoryByVariantId,
    variantId,
    quantity,
    requiredDate,
    product.leadTimeDaysReorder,
  ]);

  // Imagen del producto que se muestra en el LivePreview.
  // Si la zona tiene imageUrl real (https://...), úsala; sino fallback a la
  // variante o la featured. Algunos productos no van a tener imágenes por zona
  // configuradas hasta que el equipo suba fotos de cada ángulo a Shopify CDN.
  const previewImage = useMemo(() => {
    if (selectedArea?.imageUrl?.includes("cdn.shopify.com/s/")) {
      return {
        url: selectedArea.imageUrl,
        altText: `${product.title} · ${selectedArea.label}`,
        width: 1200,
        height: 1200,
      };
    }
    return selectedVariant?.image ?? product.featuredImage;
  }, [selectedArea, selectedVariant, product]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* Columna izquierda: preview Konva + logo uploader */}
      <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <LivePreview
          productImage={previewImage}
          area={selectedArea}
          logoUrl={logoUrl}
        />
        <LogoUploader
          logoUrl={logoUrl}
          onChange={(url) => setLogoUrl(url)}
        />
      </div>

      {/* Columna derecha: selectores + pricing + stock */}
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

        {pricing && (
          <PricingPanel
            pricing={pricing}
            quantity={quantity}
            volumePricing={product.volumePricing}
            onJumpToQuantity={setQuantity}
          />
        )}

        {stockAnalysis && (
          <StockAnalysis
            analysis={stockAnalysis}
            requiredDate={new Date(requiredDate)}
          />
        )}

        <button
          type="button"
          disabled
          className="w-full rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text opacity-60"
          title="Disponible en Fase 2e"
        >
          Agregar a cotización (Fase 2e)
        </button>
      </div>
    </div>
  );
}
