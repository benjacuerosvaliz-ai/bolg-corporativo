import "server-only";
import { SHOPIFY_ENV, assertAdminEnv } from "./env";

/**
 * OAuth client credentials grant para apps del Shopify Dev Dashboard.
 *
 * Las custom apps legacy (que daban un `shpat_` estático) se descontinuaron
 * el 1 de enero de 2026. Las apps nuevas del Dev Dashboard usan OAuth2:
 * intercambias client_id + client_secret por un access_token que dura 24h.
 *
 * El access_token devuelto SÍ tiene prefix `shpat_` (Shopify lo emite con el
 * formato tradicional, solo cambia cómo se obtiene). Se usa exactamente igual
 * en el header `X-Shopify-Access-Token`.
 *
 * Cache: in-memory por proceso. En Vercel cada lambda/instance tiene su propia
 * caché — está bien, hacer un exchange cada arranque cuesta ~200ms una vez por
 * instance y se amortiza por 23h. Si necesitamos compartir entre instances
 * (high traffic), pasamos a Vercel KV con TTL.
 */

type CachedToken = {
  accessToken: string;
  /** Timestamp ms en el que vence. */
  expiresAtMs: number;
};

let cached: CachedToken | null = null;

/** Refresh proactivo cuando faltan menos de 5 minutos para vencer. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export async function getAdminAccessToken(): Promise<string> {
  assertAdminEnv();

  const now = Date.now();
  if (cached && cached.expiresAtMs - REFRESH_MARGIN_MS > now) {
    return cached.accessToken;
  }

  cached = await exchangeClientCredentials();
  return cached.accessToken;
}

async function exchangeClientCredentials(): Promise<CachedToken> {
  const endpoint = `https://${SHOPIFY_ENV.storeDomain}/admin/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: SHOPIFY_ENV.adminClientId,
    client_secret: SHOPIFY_ENV.adminClientSecret,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Shopify OAuth ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }

  const json = (await res.json()) as {
    access_token: string;
    scope: string;
    expires_in: number;
  };

  if (!json.access_token) {
    throw new Error("Shopify OAuth: respuesta sin access_token.");
  }

  return {
    accessToken: json.access_token,
    expiresAtMs: Date.now() + json.expires_in * 1000,
  };
}

/** Invalida el cache. Útil para tests o si Shopify devuelve 401. */
export function invalidateAdminTokenCache(): void {
  cached = null;
}
