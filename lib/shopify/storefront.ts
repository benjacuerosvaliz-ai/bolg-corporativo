import { SHOPIFY_ENV, USE_MOCK_PRODUCTS, assertStorefrontEnv } from "./env";
import type { CorporateProduct } from "./types";
import { mockCorporateProducts, mockProductByHandle } from "./mock";

/**
 * Cliente del Storefront API de Shopify. Read-only, público.
 *
 * En Fase 0 funciona en modo mock (USE_MOCK_PRODUCTS=true). El cliente real
 * se conecta en Fase 1/2 cuando los metafields corporate.* estén configurados
 * en el Shopify de BOLG.
 *
 * TODO Fase 1: implementar query GraphQL real contra Storefront API.
 */

export async function listCorporateProducts(): Promise<CorporateProduct[]> {
  if (USE_MOCK_PRODUCTS) {
    return mockCorporateProducts;
  }
  assertStorefrontEnv();
  // TODO Fase 1: GraphQL query con filtro por tag CORPORATIVO + metafields.
  throw new Error(
    "Storefront client real todavía no implementado. Usa USE_MOCK_PRODUCTS=true para Fase 0-1.",
  );
}

export async function getCorporateProductByHandle(
  handle: string,
): Promise<CorporateProduct | null> {
  if (USE_MOCK_PRODUCTS) {
    return mockProductByHandle(handle);
  }
  assertStorefrontEnv();
  // TODO Fase 1: GraphQL query productByHandle con todos los metafields.
  throw new Error(
    "Storefront client real todavía no implementado. Usa USE_MOCK_PRODUCTS=true para Fase 0-1.",
  );
}

export function storefrontEndpoint(): string {
  return `https://${SHOPIFY_ENV.storeDomain}/api/${SHOPIFY_ENV.apiVersion}/graphql.json`;
}
