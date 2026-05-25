# Changelog — BOLG Corporativo

## Fase 0 — Setup (2026-05-25)

**Objetivo:** dejar el proyecto andando con identidad visual de BOLG, tipos del dominio y mock data para desarrollar el resto sin depender del Shopify real todavía.

### Hecho
- Scaffolding Next.js 16 (App Router) + TypeScript estricto con `noUncheckedIndexedAccess` + Tailwind v4.
- Tokens de marca extraídos del theme export oficial de bolg.cl (Impulse v7.6.2):
  - Paleta monocromática negro/blanco, burgundy `#682d2d` como único acento.
  - Mona Sans (light, uppercase) para headings; Basic Commercial (placeholder Inter) para body.
  - `button_style: round-slight` → radius 3px.
- `lib/brand/bolg-tokens.ts` como single source of truth, espejado en `app/globals.css` con `@theme`.
- Tipos del dominio: `CorporateProduct`, `ProductVariant`, `PrintArea`, `PrintTechnique`, `VolumeBreak`, `Quote`, `QuoteLine`, `LinePricing`.
- Clientes Shopify stub (`storefront.ts`, `admin.ts`) con feature flag `USE_MOCK_PRODUCTS=true`.
- Mock data realista de 3 productos (mochila, botella, polera) con metafields corporate.* completos.
- Layout base con `BrandHeader` + `BrandFooter` + Logo wordmark.
- Utilidades base: `cn`, `formatCLP`, `isValidRut`.

### Pendiente para Benja
- Decidir licencia de **Basic Commercial** (Adobe Fonts vs alternativa free). Mientras tanto, body usa Inter.
- Conseguir credenciales Shopify Storefront + Admin token cuando esté listo para conectar al catálogo real.
- Confirmar org de GitHub donde se creará `bolg-corporativo` (la cuenta actualmente autenticada es `benjacuerosvaliz-ai`, que es del ecosistema Valiz — probablemente no es la correcta para BOLG).

### Próximo
- Fase 1: Landing B2B + Catálogo + filtros + `ProductCard`.
