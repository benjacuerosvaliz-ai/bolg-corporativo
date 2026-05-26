import { SHOPIFY_ENV, USE_MOCK_PRODUCTS, assertStorefrontEnv } from "./env";
import type { CorporateProduct } from "./types";
import { mockCorporateProducts, mockProductByHandle } from "./mock";
import {
  LIST_CORPORATE_PRODUCTS,
  GET_CORPORATE_PRODUCT_BY_HANDLE,
} from "./queries";
import {
  mapShopifyProductToCorporate,
  type RawShopifyProduct,
} from "./mappers";

/**
 * Cliente del Storefront API de Shopify. Read-only.
 *
 * Con USE_MOCK_PRODUCTS=true → devuelve mockCorporateProducts.
 * Con USE_MOCK_PRODUCTS=false → consulta Shopify y mapea los metafields
 * corporate.*. Si algún producto taggeado CORPORATIVO no tiene los
 * metafields, lanza un error explicativo (no rellena con defaults
 * silenciosos para no engañar al equipo comercial).
 */

const STOREFRONT_ENDPOINT = () =>
  `https://${SHOPIFY_ENV.storeDomain}/api/${SHOPIFY_ENV.apiVersion}/graphql.json`;

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  assertStorefrontEnv();
  const res = await fetch(STOREFRONT_ENDPOINT(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_ENV.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Shopify Storefront API ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      `Shopify Storefront GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) {
    throw new Error("Shopify Storefront response sin data.");
  }
  return json.data;
}

export async function listCorporateProducts(): Promise<CorporateProduct[]> {
  if (USE_MOCK_PRODUCTS) return mockCorporateProducts;

  const data = await storefrontFetch<{
    products: { edges: { node: RawShopifyProduct }[] };
  }>(LIST_CORPORATE_PRODUCTS, { first: 50 });

  // Tolerante en bulk: filtra productos sin metafields completos con warn
  // server-side. Productos individuales (getCorporateProductByHandle) siguen
  // estrictos para que el dev sepa exactamente qué configurar.
  const out: CorporateProduct[] = [];
  for (const edge of data.products.edges) {
    try {
      out.push(mapShopifyProductToCorporate(edge.node));
    } catch (err) {
      console.warn(
        `[catalogo] Skipping ${edge.node.handle}: ${(err as Error).message}`,
      );
    }
  }
  return out;
}

export async function getCorporateProductByHandle(
  handle: string,
): Promise<CorporateProduct | null> {
  if (USE_MOCK_PRODUCTS) return mockProductByHandle(handle);

  const data = await storefrontFetch<{ product: RawShopifyProduct | null }>(
    GET_CORPORATE_PRODUCT_BY_HANDLE,
    { handle },
  );

  if (!data.product) return null;
  return mapShopifyProductToCorporate(data.product);
}
