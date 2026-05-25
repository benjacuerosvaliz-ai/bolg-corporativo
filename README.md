# BOLG Corporativo

Plataforma B2B de cotización corporativa para BOLG. Subdominio: `corporativo.bolg.cl`.

Conectada al Shopify principal de BOLG (Storefront + Admin API). Permite a empresas cotizar productos personalizados con su logo, ver precios por volumen, stock real y timeline de producción/entrega.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19**
- **TypeScript estricto** (`strict`, `noUncheckedIndexedAccess`)
- **Tailwind v4** con tokens BOLG declarados en `@theme`
- **next/font** para Mona Sans (heading) e Inter (body, placeholder hasta resolver licencia de Basic Commercial)
- Mock data activable con `USE_MOCK_PRODUCTS=true` mientras los metafields de Shopify se configuran

## Setup local

```bash
npm install
cp .env.example .env.local   # rellena lo que tengas, deja USE_MOCK_PRODUCTS=true
npm run dev                   # http://localhost:3500
```

## Estructura

```
app/                    Rutas App Router
components/
  brand/                Logo, BrandHeader, BrandFooter
  ui/                   shadcn (próximas fases)
lib/
  brand/                bolg-tokens.ts — single source of truth de marca
  shopify/              Clientes Storefront + Admin, tipos, mock data
  quote/                Tipos de cotización (engine de pricing en Fase 2)
  utils/                cn, money, rut
public/
  brand/                Assets de marca (logos cuando lleguen)
docs/
  CHANGELOG.md          Bitácora por fase
```

## Fases del build

Ver `docs/CHANGELOG.md` para el estado actual.

- **Fase 0** Setup, tokens, types, mocks, layout base ✅
- Fase 1: Landing B2B + Catálogo
- Fase 2: PDP + Configurador con Konva + Engine de pricing/stock
- Fase 3: Cotizador multi-producto
- Fase 4: PDF + Emails (Resend)
- Fase 5: Auth magic link + Mis Cotizaciones + Link público
- Fase 6: Draft Order en Shopify Admin + Aprobación
- Fase 7: Polish, animaciones, tests, Lighthouse

## Notas

- **Aislamiento total** vs Valiz / ORIA / Atlas / PersonalizadosLaser. Nada se comparte.
- **Idioma:** español Chile (tú forms, nunca voseo).
- **Push y deploy** los hace Benja manualmente — los commits locales sí los puede hacer el agente.
