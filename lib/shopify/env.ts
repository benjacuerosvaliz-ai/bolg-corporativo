/**
 * Env vars validation. Importado por cualquier módulo que toque Shopify.
 * Las admin/storefront APIs son lazy — solo lanzan si efectivamente se usan
 * sin USE_MOCK_PRODUCTS.
 */

export const SHOPIFY_ENV = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  storefrontToken: process.env.SHOPIFY_STOREFRONT_API_TOKEN ?? "",
  adminToken: process.env.SHOPIFY_ADMIN_API_TOKEN ?? "",
  apiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-01",
} as const;

export const USE_MOCK_PRODUCTS = process.env.USE_MOCK_PRODUCTS === "true";

export function assertStorefrontEnv(): void {
  if (USE_MOCK_PRODUCTS) return;
  if (!SHOPIFY_ENV.storeDomain || !SHOPIFY_ENV.storefrontToken) {
    throw new Error(
      "Falta SHOPIFY_STORE_DOMAIN o SHOPIFY_STOREFRONT_API_TOKEN. Configura .env.local o activa USE_MOCK_PRODUCTS=true.",
    );
  }
}

export function assertAdminEnv(): void {
  if (USE_MOCK_PRODUCTS) return;
  if (!SHOPIFY_ENV.storeDomain || !SHOPIFY_ENV.adminToken) {
    throw new Error(
      "Falta SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN. Configura .env.local (server-only) o activa USE_MOCK_PRODUCTS=true.",
    );
  }
}
