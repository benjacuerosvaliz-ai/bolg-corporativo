/**
 * Tipos del dominio corporativo de BOLG.
 *
 * Single source of truth = Shopify. Estos tipos representan el "view"
 * que la plataforma corporativa proyecta sobre los productos elegibles
 * (tag CORPORATIVO o metafield corporate.eligible = true).
 */

export type Money = {
  amount: number;
  currencyCode: "CLP" | "USD";
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  /** Atributos visibles para el cliente (color, talla, etc.). */
  selectedOptions: { name: string; value: string }[];
  /** Precio retail base. El cálculo corporativo aplica volume_pricing sobre esto. */
  priceRetail: Money;
  image: ShopifyImage | null;
  /** Disponibilidad consultada vía Storefront. Stock real va por Admin API. */
  availableForSale: boolean;
};

/**
 * Una zona donde se puede aplicar el logo del cliente.
 * Coordenadas en pixeles sobre imageUrl. Polígono define el área válida.
 */
export type PrintArea = {
  id: string;
  /** "Bolsillo frontal", "Lateral derecho", "Asa", etc. */
  label: string;
  /** Imagen del producto vista desde el ángulo de esta zona. */
  imageUrl: string;
  /** Polígono que delimita el área de impresión en píxeles. */
  areaPolygon: Array<[number, number]>;
  maxWidthCm: number;
  maxHeightCm: number;
  /** Escala para convertir píxeles → centímetros reales. */
  pxPerCm: number;
};

export type PrintTechniqueId =
  | "serigrafia_1c"
  | "serigrafia_full"
  | "bordado"
  | "transfer_dtf"
  | "laser"
  | "sublimacion";

export type PrintTechnique = {
  id: PrintTechniqueId;
  label: string;
  description: string;
  /** Costo unitario base de la técnica (CLP neto). */
  basePriceUnit: number;
  /** Costo adicional por cada zona extra después de la primera. */
  extraPositionPrice: number;
  /** Setup fee fijo (ej. pantallas de serigrafía). 0 si no aplica. */
  setupFee: number;
  /** Días extra al lead time. */
  extraLeadDays: number;
  /** Zonas (PrintArea.id) en las que esta técnica está disponible. */
  availableAreaIds: string[];
};

export type VolumeBreak = {
  minQty: number;
  /** Precio unitario neto en CLP para esta cantidad o más. */
  unitPriceNet: number;
};

/** Producto elegible para cotización corporativa. */
export type CorporateProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  /** "Mochilas", "Botellas", "Accesorios", etc. */
  category: string;
  description: string;
  descriptionHtml: string;
  /** Imagen principal de catálogo. */
  featuredImage: ShopifyImage;
  /** Galería completa. */
  images: ShopifyImage[];
  variants: ProductVariant[];

  /** Mínimo de unidades para cotizar este producto en B2B. */
  minQty: number;
  /** Días desde que se hace re-order al proveedor hasta llegar a CL. */
  leadTimeDaysReorder: number;
  /** Costo base USD por unidad (para cálculos internos de re-order). */
  baseCostUsd: number;
  /** Tabla de descuentos por volumen. Ordenada asc por minQty. */
  volumePricing: VolumeBreak[];
  /** Zonas de impresión configuradas. */
  printAreas: PrintArea[];
  /** Técnicas disponibles para este producto. */
  printTechniques: PrintTechnique[];

  tags: string[];
};
