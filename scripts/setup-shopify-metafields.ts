/**
 * Setup de metafields corporate.* en Shopify via Admin API.
 *
 * Uso:
 *   1. Asegúrate de tener SHOPIFY_ADMIN_API_TOKEN en .env.local
 *      (crear custom app en Shopify Admin → docs/SHOPIFY_SETUP.md).
 *   2. npm run setup:shopify
 *
 * Lo que hace:
 *   - Crea 7 metafield definitions del namespace `corporate` con visibilidad
 *     Storefront (para que el Storefront API las pueda leer).
 *   - Idempotente: si ya existen, las salta sin error.
 *
 * Lo que NO hace:
 *   - No popula valores en productos. Eso se hace producto-por-producto desde
 *     Shopify Admin (manualmente) o con `npm run setup:shopify -- --seed-demo`
 *     que llena 1 producto de demo con valores razonables.
 */

import { config } from "node:process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Cargar .env.local manualmente sin depender de dotenv.
loadEnvLocal();

const STORE_DOMAIN = required("SHOPIFY_STORE_DOMAIN");
const ADMIN_TOKEN = required("SHOPIFY_ADMIN_API_TOKEN");
const API_VERSION = process.env["SHOPIFY_API_VERSION"] ?? "2025-01";
const ADMIN_ENDPOINT = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

type MetafieldDef = {
  name: string;
  key: string;
  namespace: "corporate";
  description: string;
  type: string;
  visibleToStorefrontApi: boolean;
};

const DEFINITIONS: MetafieldDef[] = [
  {
    name: "Elegible para corporativo",
    key: "eligible",
    namespace: "corporate",
    description: "Confirma si este producto se muestra en corporativo.bolg.cl.",
    type: "boolean",
    visibleToStorefrontApi: true,
  },
  {
    name: "Mínimo de cotización corporativa",
    key: "min_qty",
    namespace: "corporate",
    description: "Cantidad mínima para cotizar este producto en B2B.",
    type: "number_integer",
    visibleToStorefrontApi: true,
  },
  {
    name: "Lead time de reposición (días)",
    key: "lead_time_days_reorder",
    namespace: "corporate",
    description: "Días desde re-order al proveedor hasta llegada a Chile.",
    type: "number_integer",
    visibleToStorefrontApi: true,
  },
  {
    name: "Costo base USD",
    key: "base_cost_usd",
    namespace: "corporate",
    description: "Costo unitario base en USD (cálculos internos).",
    type: "number_decimal",
    visibleToStorefrontApi: true,
  },
  {
    name: "Tabla de precios por volumen",
    key: "volume_pricing",
    namespace: "corporate",
    description:
      'JSON array. Ej: [{"minQty":50,"unitPriceNet":18990},{"minQty":100,"unitPriceNet":16990}]',
    type: "json",
    visibleToStorefrontApi: true,
  },
  {
    name: "Zonas de impresión",
    key: "print_areas",
    namespace: "corporate",
    description:
      'JSON array de zonas con polígonos y cm reales. Ver docs/SHOPIFY_SETUP.md.',
    type: "json",
    visibleToStorefrontApi: true,
  },
  {
    name: "Técnicas de impresión",
    key: "print_techniques",
    namespace: "corporate",
    description:
      'JSON array con técnicas disponibles, costos, setup y tiempos. Ver docs/SHOPIFY_SETUP.md.',
    type: "json",
    visibleToStorefrontApi: true,
  },
];

async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Shopify Admin ${res.status}: ${await res.text()}`);
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
  if (!json.data) throw new Error("Sin data en response.");
  return json.data;
}

const CREATE_DEFINITION = /* GraphQL */ `
  mutation CreateDef($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        namespace
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

async function createDefinition(def: MetafieldDef): Promise<void> {
  const data = await adminFetch<{
    metafieldDefinitionCreate: {
      createdDefinition: { id: string } | null;
      userErrors: { field: string[] | null; message: string; code: string }[];
    };
  }>(CREATE_DEFINITION, {
    definition: {
      name: def.name,
      namespace: def.namespace,
      key: def.key,
      description: def.description,
      type: def.type,
      ownerType: "PRODUCT",
      access: {
        admin: "MERCHANT_READ_WRITE",
        storefront: def.visibleToStorefrontApi ? "PUBLIC_READ" : "NONE",
      },
    },
  });

  const errors = data.metafieldDefinitionCreate.userErrors;
  const alreadyExists = errors.some(
    (e) => e.code === "TAKEN" || e.message.toLowerCase().includes("taken"),
  );
  if (alreadyExists) {
    console.log(`  ↪︎ corporate.${def.key} ya existía, OK.`);
    return;
  }
  if (errors.length > 0) {
    throw new Error(
      `corporate.${def.key}: ${errors.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; ")}`,
    );
  }
  console.log(`  ✓ corporate.${def.key} creado.`);
}

async function main(): Promise<void> {
  console.log(`\n🔧 Setup metafields en ${STORE_DOMAIN}\n`);

  for (const def of DEFINITIONS) {
    try {
      await createDefinition(def);
    } catch (err) {
      console.error(`  ✗ ${def.key}:`, (err as Error).message);
    }
  }

  console.log(
    `\n✅ Listo. Ahora configura los valores producto-por-producto en
   Shopify Admin → Products → [producto con tag CORPORATIVO] → Metafields.
   Ejemplos de JSON en docs/SHOPIFY_SETUP.md.\n
   Una vez al menos 1 producto tenga todos los valores, cambia
   USE_MOCK_PRODUCTS=false y reinicia el dev server.\n`,
  );
}

// --- helpers ----------------------------------------------------------------

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n✗ Falta ${name} en .env.local\n`);
    process.exit(1);
  }
  return v;
}

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local opcional — si no existe, dependemos del entorno del shell.
  }
}

main().catch((err) => {
  console.error("\n✗ Error fatal:", err);
  process.exit(1);
});

// Para que TS no se queje del import unused.
void config;
