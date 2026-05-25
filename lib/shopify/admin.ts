import "server-only";
import { SHOPIFY_ENV, USE_MOCK_PRODUCTS, assertAdminEnv } from "./env";

/**
 * Cliente del Admin API de Shopify. Server-only.
 *
 * Usado para:
 *  - Stock real con buffers de seguridad (no expuesto vía Storefront).
 *  - Creación de Draft Orders cuando una cotización pasa a ventas.
 *
 * TODO Fase 2: implementar getInventoryLevels(variantId, locationId).
 * TODO Fase 6: implementar createDraftOrder(quote).
 */

export type InventoryLevel = {
  variantId: string;
  available: number;
  /** Buffer reservado para retail (configurable, default 10%). */
  reservedForRetail: number;
  /** available - reservedForRetail. Lo que efectivamente está disponible para B2B. */
  availableForCorporate: number;
};

export async function getInventoryLevel(
  variantId: string,
): Promise<InventoryLevel> {
  if (USE_MOCK_PRODUCTS) {
    // Mock determinista: variantes terminadas en "high" tienen stock alto.
    const isHighStock = variantId.includes("high");
    const available = isHighStock ? 500 : 80;
    const reservedForRetail = Math.floor(available * 0.1);
    return {
      variantId,
      available,
      reservedForRetail,
      availableForCorporate: available - reservedForRetail,
    };
  }
  assertAdminEnv();
  throw new Error(
    "Admin client real todavía no implementado. Usa USE_MOCK_PRODUCTS=true para Fase 0-1.",
  );
}

export function adminEndpoint(): string {
  return `https://${SHOPIFY_ENV.storeDomain}/admin/api/${SHOPIFY_ENV.apiVersion}/graphql.json`;
}
