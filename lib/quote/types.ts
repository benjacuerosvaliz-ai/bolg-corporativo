import type { PrintTechniqueId } from "@/lib/shopify/types";

export type QuoteLine = {
  id: string;
  productId: string;
  productHandle: string;
  productTitle: string;
  productImageUrl: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  printTechniqueId: PrintTechniqueId;
  /** IDs de PrintArea seleccionadas (puede haber varias). */
  printAreaIds: string[];
  /** URL del logo del cliente (Vercel Blob). null si todavía no sube. */
  logoUrl: string | null;
  /** Posición/escala del logo sobre el preview Konva, por zona. */
  logoTransforms: Record<string, LogoTransform>;
  /** Fecha objetivo de entrega que pidió el cliente. */
  requiredDate: string; // ISO date
  /** Contexto opcional: "regalo navidad", "evento", "onboarding"... */
  occasion: string | null;
  /** Notas libres del cliente para esta línea. */
  notes: string | null;
  /** Snapshot del cálculo al momento de agregar la línea. */
  pricing: LinePricing;
};

export type LogoTransform = {
  x: number;
  y: number;
  widthPx: number;
  heightPx: number;
  rotationDeg: number;
};

export type LinePricing = {
  unitPriceNet: number;
  customizationUnitPrice: number;
  setupFee: number;
  subtotalNet: number;
  iva: number;
  totalGross: number;
  /** Volume break aplicado en este cálculo. */
  appliedBreak: { minQty: number; unitPriceNet: number };
  /** Próximo break si existe (para mostrar "sube a X y ahorra Y"). */
  nextBreak: { minQty: number; unitPriceNet: number; savings: number } | null;
  /** Cuánto se ahorra vs el primer break (sin descuento por volumen). */
  savingsVsBaseline: number;
};

export type QuoteCustomer = {
  companyName: string;
  rut: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  giro: string | null;
  billingAddress: string | null;
};

export type QuoteStatus =
  | "draft"
  | "sent_to_sales"
  | "approved_by_client"
  | "in_production"
  | "shipped"
  | "completed"
  | "canceled";

export type Quote = {
  id: string;
  /** Token UUID v7 firmado, para el link público de aprobación. */
  publicToken: string;
  status: QuoteStatus;
  customer: QuoteCustomer | null;
  lines: QuoteLine[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** Validez en días desde createdAt. Default 15. */
  validityDays: number;
  /** ID del Draft Order en Shopify una vez enviado a ventas. */
  shopifyDraftOrderId: string | null;
};
