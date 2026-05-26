/**
 * Popula metafields corporate.* en bulk para productos B2B.
 *
 * La data sensible (SKUs, precios, costos) vive en
 * `scripts/populate-products.data.local.ts` que está gitignored.
 * Este archivo solo tiene la lógica + perfiles por familia.
 *
 * Por cada producto:
 *   1. Agrega tag CORPORATIVO si no lo tiene.
 *   2. Setea los 7 metafields del namespace corporate.
 *
 * Idempotente: re-correrlo solo actualiza los valores actuales.
 *
 * Uso:
 *   1. Crear scripts/populate-products.data.local.ts exportando PRODUCTS.
 *      Ver tipo ProductRow abajo o copiar del último commit con la data.
 *   2. npm run populate:products
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, type ProductRow, type Family, type Technique } from "./populate-products.data.local";

// --- Env loading ------------------------------------------------------------

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnvLocal();

const STORE = process.env["SHOPIFY_STORE_DOMAIN"]!;
const CLIENT_ID = process.env["SHOPIFY_ADMIN_CLIENT_ID"]!;
const CLIENT_SECRET = process.env["SHOPIFY_ADMIN_CLIENT_SECRET"]!;
const API_VERSION = process.env["SHOPIFY_API_VERSION"] ?? "2026-04";
if (!STORE || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("✗ Faltan env vars de Shopify Admin.");
  process.exit(1);
}

// --- OAuth + Admin GraphQL --------------------------------------------------

async function getToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function admin<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(
    `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) throw new Error(`Admin ${res.status}: ${await res.text()}`);
  const j = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join("; "));
  if (!j.data) throw new Error("Sin data");
  return j.data;
}

// --- Perfiles por familia (no sensibles, pueden vivir en repo público) ------

/** Tramos de cantidad por familia (los 4 breaks). */
const TRAMOS: Record<Family, [number, number, number, number]> = {
  mochila: [10, 21, 31, 61],
  bolso: [10, 21, 31, 61],
  botella: [10, 21, 51, 101],
  jockey: [10, 21, 51, 101],
  billetera: [10, 21, 51, 101],
  llavero: [10, 21, 51, 101],
};

/** Dimensiones de zona de impresión por familia. */
const PRINT_AREAS_BY_FAMILY: Record<
  Family,
  Array<{
    id: string;
    label: string;
    imageUrl: string;
    areaPolygon: number[][];
    maxWidthCm: number;
    maxHeightCm: number;
    pxPerCm: number;
  }>
> = {
  mochila: [{ id: "frente", label: "Frente", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 12, maxHeightCm: 10, pxPerCm: 30 }],
  bolso: [{ id: "frente", label: "Frente", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 15, maxHeightCm: 12, pxPerCm: 30 }],
  botella: [{ id: "lateral", label: "Lateral", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 6, maxHeightCm: 6, pxPerCm: 30 }],
  jockey: [{ id: "frente", label: "Frente", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 8, maxHeightCm: 4, pxPerCm: 30 }],
  billetera: [{ id: "frente", label: "Frente", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 6, maxHeightCm: 3, pxPerCm: 40 }],
  llavero: [{ id: "frente", label: "Frente", imageUrl: "", areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]], maxWidthCm: 3, maxHeightCm: 3, pxPerCm: 50 }],
};

/**
 * Override de print_areas para SKUs específicos donde el default por familia
 * no aplica. Caso típico: Singapur y Vientian tienen 2 caras donde se puede
 * grabar — frente (sobre logo BØLG) o reverso (cara plana).
 *
 * Cliente elige la zona en el PrintAreaSelector y eso queda registrado en
 * la cotización (afecta producción).
 */
const PRINT_AREAS_OVERRIDE: Record<
  string,
  typeof PRINT_AREAS_BY_FAMILY[Family]
> = {
  // Billetera Singapur — 4 colores
  A06I02: TWO_ZONES_BILLETERA(),
  A06I01: TWO_ZONES_BILLETERA(),
  A06I15: TWO_ZONES_BILLETERA(),
  A06I16: TWO_ZONES_BILLETERA(),
  // Billetera Vientian
  A06AC02: TWO_ZONES_BILLETERA(),
};

function TWO_ZONES_BILLETERA() {
  return [
    {
      id: "frente",
      label: "Frente (sobre logo BØLG)",
      imageUrl: "",
      areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]],
      maxWidthCm: 6,
      maxHeightCm: 3,
      pxPerCm: 40,
    },
    {
      id: "reverso",
      label: "Reverso (cara plana)",
      imageUrl: "",
      areaPolygon: [[0, 0], [0, 0], [0, 0], [0, 0]],
      maxWidthCm: 6,
      maxHeightCm: 3,
      pxPerCm: 40,
    },
  ];
}

/**
 * Técnicas con precio extra de personalización por unidad.
 * Láser lo hacemos in-house (sale más barato); el resto se externaliza.
 */
const TECHNIQUES_BY_KEY: Record<
  Technique,
  Array<{
    id: string;
    label: string;
    description: string;
    basePriceUnit: number;
    extraPositionPrice: number;
    setupFee: number;
    extraLeadDays: number;
    availableAreaIds: string[];
  }>
> = {
  dtf: [
    { id: "transfer_dtf", label: "Transfer DTF", description: "Full color en cualquier tela. Sin setup fee. Recomendado para tirajes medianos.", basePriceUnit: 4000, extraPositionPrice: 0, setupFee: 0, extraLeadDays: 7, availableAreaIds: ["frente", "lateral"] },
  ],
  serigrafia_bordado: [
    { id: "serigrafia_1c", label: "Serigrafía 1 color", description: "Económica y duradera. Ideal para logos sólidos sobre tela.", basePriceUnit: 4000, extraPositionPrice: 0, setupFee: 0, extraLeadDays: 7, availableAreaIds: ["frente", "lateral"] },
    { id: "bordado", label: "Bordado", description: "Acabado premium en tela. Ideal para logos pequeños y medianos.", basePriceUnit: 4000, extraPositionPrice: 0, setupFee: 0, extraLeadDays: 10, availableAreaIds: ["frente", "lateral"] },
  ],
  laser: [
    { id: "laser", label: "Grabado láser", description: "Acabado permanente y elegante. Lo hacemos in-house, sin externalizar.", basePriceUnit: 900, extraPositionPrice: 0, setupFee: 0, extraLeadDays: 5, availableAreaIds: ["frente", "lateral", "reverso"] },
  ],
  bordado: [
    { id: "bordado", label: "Bordado", description: "Acabado premium en tela.", basePriceUnit: 4000, extraPositionPrice: 0, setupFee: 0, extraLeadDays: 10, availableAreaIds: ["frente", "lateral"] },
  ],
};

// --- Lookup SKU → product ID ------------------------------------------------

async function resolveProductIds(token: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const p of PRODUCTS) {
    const q = `{ productVariants(first: 1, query: "sku:${p.sku}") { edges { node { product { id } } } } }`;
    const data = await admin<{
      productVariants: { edges: { node: { product: { id: string } } }[] };
    }>(token, q);
    const id = data.productVariants.edges[0]?.node.product.id;
    if (id) map.set(p.sku, id);
  }
  return map;
}

// --- Apply tag + metafields -------------------------------------------------

const ADD_TAG = /* GraphQL */ `
  mutation AddTag($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;

const SET_METAFIELDS = /* GraphQL */ `
  mutation Set($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key }
      userErrors { field message }
    }
  }
`;

async function processOne(token: string, p: ProductRow, productId: string) {
  await admin(token, ADD_TAG, { id: productId, tags: ["CORPORATIVO"] });

  // Si el SKU tiene override (ej. Singapur/Vientian con 2 zonas), úsalo;
  // sino default por familia (mochila = solo frente, botella = solo lateral, etc.).
  const printAreas =
    PRINT_AREAS_OVERRIDE[p.sku] ?? PRINT_AREAS_BY_FAMILY[p.family];
  const printTechniques = TECHNIQUES_BY_KEY[p.technique];
  const volumePricing = JSON.stringify(
    TRAMOS[p.family].map((minQty, i) => ({ minQty, unitPriceNet: p.breaks[i] })),
  );
  const baseCostUsd = (p.costCLP / 950).toFixed(2);

  const metafields = [
    { ownerId: productId, namespace: "corporate", key: "eligible", type: "boolean", value: "true" },
    { ownerId: productId, namespace: "corporate", key: "min_qty", type: "number_integer", value: "10" },
    { ownerId: productId, namespace: "corporate", key: "lead_time_days_reorder", type: "number_integer", value: "150" },
    { ownerId: productId, namespace: "corporate", key: "base_cost_usd", type: "number_decimal", value: baseCostUsd },
    { ownerId: productId, namespace: "corporate", key: "volume_pricing", type: "json", value: volumePricing },
    { ownerId: productId, namespace: "corporate", key: "print_areas", type: "json", value: JSON.stringify(printAreas) },
    { ownerId: productId, namespace: "corporate", key: "print_techniques", type: "json", value: JSON.stringify(printTechniques) },
  ];

  const result = await admin<{
    metafieldsSet: { userErrors: { field: string[] | null; message: string }[] };
  }>(token, SET_METAFIELDS, { metafields });

  const errors = result.metafieldsSet.userErrors;
  if (errors.length > 0) {
    throw new Error(errors.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; "));
  }
}

// --- Main -------------------------------------------------------------------

async function main() {
  console.log(`\n🏭 Populate de ${PRODUCTS.length} productos corporativos\n`);
  console.log("→ Intercambiando credenciales por access_token...");
  const token = await getToken();
  console.log(`  ✓ Token obtenido\n`);

  console.log("→ Resolviendo SKUs a product IDs...");
  const idMap = await resolveProductIds(token);
  console.log(`  ✓ ${idMap.size} de ${PRODUCTS.length} SKUs encontrados\n`);

  console.log("→ Aplicando tag + metafields:");
  let ok = 0;
  let err = 0;
  for (const p of PRODUCTS) {
    const id = idMap.get(p.sku);
    if (!id) {
      console.warn(`  ⚠ ${p.sku} ${p.description} → skip (sin product ID)`);
      err++;
      continue;
    }
    try {
      await processOne(token, p, id);
      console.log(`  ✓ ${p.sku.padEnd(10)} ${p.description}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${p.sku.padEnd(10)} ${p.description}: ${(e as Error).message}`);
      err++;
    }
  }

  console.log(`\n✅ ${ok} OK, ${err} errores.\n`);
}

main().catch((e) => {
  console.error("\n✗ Error fatal:", e);
  process.exit(1);
});
