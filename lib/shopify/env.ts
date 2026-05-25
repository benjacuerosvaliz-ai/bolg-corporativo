/**
 * Env vars validation. Importado por cualquier módulo que toque Shopify.
 * Las admin/storefront APIs son lazy — solo lanzan si efectivamente se usan
 * sin USE_MOCK_PRODUCTS.
 */

export const SHOPIFY_ENV = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  storefrontToken: process.env.SHOPIFY_STOREFRONT_API_TOKEN ?? "",
  /**
   * Admin API se autentica vía OAuth client credentials grant.
   * El access_token se obtiene en runtime intercambiando estas dos credenciales
   * contra /admin/oauth/access_token (ver lib/shopify/admin-auth.ts).
   * El access_token dura 24h y se cachea in-memory.
   */
  adminClientId: process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "",
  adminClientSecret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "",
  apiVersion: process.env.SHOPIFY_API_VERSION ?? "2026-04",
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
  if (
    !SHOPIFY_ENV.storeDomain ||
    !SHOPIFY_ENV.adminClientId ||
    !SHOPIFY_ENV.adminClientSecret
  ) {
    throw new Error(
      "Falta SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID o SHOPIFY_ADMIN_CLIENT_SECRET. Configura .env.local (server-only) o activa USE_MOCK_PRODUCTS=true.",
    );
  }
}
