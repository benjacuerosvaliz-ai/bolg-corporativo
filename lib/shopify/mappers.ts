import type {
  CorporateProduct,
  PrintArea,
  PrintTechnique,
  ProductVariant,
  ShopifyImage,
  VolumeBreak,
} from "./types";

/**
 * Tipos parciales del response GraphQL — sin generar codegen completo.
 * Coincide con el fragment ProductFields en queries.ts.
 */
type RawMoney = { amount: string; currencyCode: string };
type RawImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};
type RawMetafield = { value: string } | null;

type RawVariantEdge = {
  node: {
    id: string;
    title: string;
    sku: string | null;
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
    price: RawMoney;
    image: RawImage | null;
  };
};

export type RawShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  featuredImage: RawImage | null;
  images: { edges: { node: RawImage }[] };
  variants: { edges: RawVariantEdge[] };
  eligible: RawMetafield;
  minQty: RawMetafield;
  leadTimeReorder: RawMetafield;
  baseCostUsd: RawMetafield;
  volumePricing: RawMetafield;
  printAreas: RawMetafield;
  printTechniques: RawMetafield;
};

class MissingMetafieldError extends Error {
  constructor(handle: string, field: string) {
    super(
      `El producto "${handle}" tiene tag CORPORATIVO pero le falta el metafield corporate.${field}. Configúralo en Shopify Admin → Productos → ${handle} → Metafields, o quita el tag CORPORATIVO.`,
    );
    this.name = "MissingMetafieldError";
  }
}

/**
 * Mapper Shopify GraphQL → CorporateProduct.
 *
 * Estricto: si faltan metafields corporate.*, lanza error claro indicando
 * qué configurar en Shopify Admin. Esto mantiene el dominio limpio y
 * evita defaults silenciosos que confundan al equipo comercial.
 */
export function mapShopifyProductToCorporate(
  raw: RawShopifyProduct,
): CorporateProduct {
  const eligible = raw.eligible?.value === "true";
  const tagCorporate = raw.tags.includes("CORPORATIVO");
  if (!eligible && !tagCorporate) {
    throw new Error(
      `El producto "${raw.handle}" no es elegible para corporativo (sin tag CORPORATIVO ni metafield corporate.eligible=true).`,
    );
  }

  if (!raw.minQty?.value) throw new MissingMetafieldError(raw.handle, "min_qty");
  if (!raw.leadTimeReorder?.value)
    throw new MissingMetafieldError(raw.handle, "lead_time_days_reorder");
  if (!raw.volumePricing?.value)
    throw new MissingMetafieldError(raw.handle, "volume_pricing");
  if (!raw.printAreas?.value)
    throw new MissingMetafieldError(raw.handle, "print_areas");
  if (!raw.printTechniques?.value)
    throw new MissingMetafieldError(raw.handle, "print_techniques");

  const minQty = Number.parseInt(raw.minQty.value, 10);
  const leadTimeDaysReorder = Number.parseInt(raw.leadTimeReorder.value, 10);
  const baseCostUsd = raw.baseCostUsd?.value
    ? Number.parseFloat(raw.baseCostUsd.value)
    : 0;
  const volumePricing = parseVolumePricing(raw.volumePricing.value, raw.handle);
  const printAreas = parsePrintAreas(raw.printAreas.value, raw.handle);
  const printTechniques = parsePrintTechniques(
    raw.printTechniques.value,
    raw.handle,
  );

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    vendor: raw.vendor,
    category: raw.productType || "Productos",
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    featuredImage: raw.featuredImage ?? {
      url: "",
      altText: raw.title,
      width: 1200,
      height: 1200,
    },
    images: raw.images.edges.map((e) => e.node satisfies ShopifyImage),
    variants: raw.variants.edges.map((e) => mapVariant(e.node)),
    minQty,
    leadTimeDaysReorder,
    baseCostUsd,
    volumePricing,
    printAreas,
    printTechniques,
    tags: raw.tags,
  };
}

function mapVariant(v: RawVariantEdge["node"]): ProductVariant {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku,
    availableForSale: v.availableForSale,
    selectedOptions: v.selectedOptions,
    priceRetail: {
      amount: Number.parseFloat(v.price.amount),
      currencyCode: v.price.currencyCode as "CLP" | "USD",
    },
    image: v.image,
  };
}

function parseVolumePricing(raw: string, handle: string): VolumeBreak[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("no es un array");
    return parsed
      .map((b: { minQty?: number; unitPriceNet?: number }) => ({
        minQty: Number(b.minQty),
        unitPriceNet: Number(b.unitPriceNet),
      }))
      .sort((a, b) => a.minQty - b.minQty);
  } catch (err) {
    throw new Error(
      `corporate.volume_pricing inválido en "${handle}". Debe ser JSON array de {minQty, unitPriceNet}. Detalle: ${(err as Error).message}`,
    );
  }
}

function parsePrintAreas(raw: string, handle: string): PrintArea[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("no es un array");
    return parsed as PrintArea[];
  } catch (err) {
    throw new Error(
      `corporate.print_areas inválido en "${handle}". Debe ser JSON array de PrintArea. Detalle: ${(err as Error).message}`,
    );
  }
}

function parsePrintTechniques(raw: string, handle: string): PrintTechnique[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("no es un array");
    return parsed as PrintTechnique[];
  } catch (err) {
    throw new Error(
      `corporate.print_techniques inválido en "${handle}". Debe ser JSON array de PrintTechnique. Detalle: ${(err as Error).message}`,
    );
  }
}
