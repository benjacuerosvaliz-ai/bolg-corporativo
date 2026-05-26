import "server-only";
import { SHOPIFY_ENV, USE_MOCK_PRODUCTS, assertAdminEnv } from "./env";
import { getAdminAccessToken } from "./admin-auth";

/**
 * Cliente del Admin API de Shopify. Server-only.
 *
 * Auth: OAuth client credentials grant (ver admin-auth.ts). Access token
 * cacheado in-memory con TTL ~23h.
 *
 * Usado para:
 *  - Stock real con buffers de seguridad (no expuesto vía Storefront).
 *  - Creación de Draft Orders cuando una cotización pasa a ventas.
 */

export type InventoryLevel = {
  variantId: string;
  available: number;
  /** Buffer reservado para retail (configurable, default 10%). */
  reservedForRetail: number;
  /** available - reservedForRetail. Lo que efectivamente está disponible para B2B. */
  availableForCorporate: number;
};

/** % del stock reservado para retail. Configurable a futuro vía metafield. */
const RETAIL_RESERVE_RATIO = 0.1;

/**
 * Suma "available" de todas las ubicaciones activas. Hoy en BØLG son 2:
 * "Bodega KW" y "Tienda BOLG Renato Sanchez". Si en el futuro hay que excluir
 * alguna (ej. tiendas físicas no comprometibles a corporativo), agregamos
 * un filtro acá sin tocar el resto del código.
 */
const INVENTORY_QUERY = /* GraphQL */ `
  query VariantInventory($id: ID!) {
    productVariant(id: $id) {
      id
      inventoryItem {
        tracked
        inventoryLevels(first: 20) {
          edges {
            node {
              location { id name }
              quantities(names: ["available"]) { name quantity }
            }
          }
        }
      }
    }
  }
`;

type InventoryLevelEdge = {
  node: {
    location: { id: string; name: string };
    quantities: { name: string; quantity: number }[];
  };
};

export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(adminEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Shopify Admin ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      `Shopify Admin GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) throw new Error("Shopify Admin response sin data.");
  return json.data;
}

export async function getInventoryLevel(
  variantId: string,
): Promise<InventoryLevel> {
  if (USE_MOCK_PRODUCTS) {
    // Mock determinista: variantes terminadas en "high" tienen stock alto.
    const isHighStock = variantId.includes("high");
    const available = isHighStock ? 500 : 80;
    const reservedForRetail = Math.floor(available * RETAIL_RESERVE_RATIO);
    return {
      variantId,
      available,
      reservedForRetail,
      availableForCorporate: available - reservedForRetail,
    };
  }
  assertAdminEnv();

  const data = await adminFetch<{
    productVariant: {
      id: string;
      inventoryItem: {
        inventoryLevels: { edges: InventoryLevelEdge[] };
      } | null;
    } | null;
  }>(INVENTORY_QUERY, { id: variantId });

  const edges = data.productVariant?.inventoryItem?.inventoryLevels.edges ?? [];
  // Suma del available de TODAS las ubicaciones activas.
  const available = edges.reduce((sum, e) => {
    const qty = e.node.quantities.find((q) => q.name === "available")?.quantity ?? 0;
    return sum + Math.max(0, qty);
  }, 0);
  const reservedForRetail = Math.floor(available * RETAIL_RESERVE_RATIO);
  return {
    variantId,
    available,
    reservedForRetail,
    availableForCorporate: Math.max(0, available - reservedForRetail),
  };
}

/**
 * Stock total disponible para corporativo de un producto, sumando todas
 * sus variantes. Útil para el catálogo (lista de productos) donde queremos
 * mostrar un badge agregado sin importar la variante específica.
 */
export async function getProductTotalStock(
  variantIds: string[],
): Promise<number> {
  if (USE_MOCK_PRODUCTS) {
    return variantIds.reduce((sum, id) => {
      const isHighStock = id.includes("high");
      const available = isHighStock ? 500 : 80;
      const reservedForRetail = Math.floor(available * RETAIL_RESERVE_RATIO);
      return sum + Math.max(0, available - reservedForRetail);
    }, 0);
  }
  assertAdminEnv();
  const levels = await Promise.all(variantIds.map((id) => getInventoryLevel(id)));
  return levels.reduce((sum, lvl) => sum + lvl.availableForCorporate, 0);
}

export function adminEndpoint(): string {
  return `https://${SHOPIFY_ENV.storeDomain}/admin/api/${SHOPIFY_ENV.apiVersion}/graphql.json`;
}
