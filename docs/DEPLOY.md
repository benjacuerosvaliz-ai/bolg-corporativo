# Deploy de BØLG Corporativo

Checklist secuencial para llevar `corporativo.bolg.cl` a producción.

Cada paso indica qué hace cada lado: **Tú** (click en UIs, copiar/pegar tokens) y **Claude** (todo lo que es código). Los pasos van en orden de dependencia — saltarse uno rompe el siguiente.

---

## 0. Pre-flight (Claude)

✅ `.gitignore` cubre `.env*` salvo `.env.example`
✅ `.env.example` documenta todas las vars con [SECRET] / [PUBLIC]
✅ Cliente Shopify Storefront real ya implementado (queda detrás del flag `USE_MOCK_PRODUCTS`)
✅ Script `npm run setup:shopify` listo (necesita Admin token)

⚠️ **Decisión pendiente — brand book**

`public/brand/BOLG Brandbook.pdf` (35MB) + los archivos `.ai` están actualmente en el folder `public/` de Next.js. Eso significa que:
1. Cuando deployes, estarán accesibles en `https://corporativo.bolg.cl/brand/BOLG%20Brandbook.pdf` (URL pública, indexable).
2. Como el repo es público en GitHub, también estarán visibles en `github.com/<tu-org>/bolg-corporativo/blob/main/public/brand/`.

**Opciones:**
- **A) Dejarlo accesible** — útil si quieres que tu equipo comercial pueda descargarlo via URL.
- **B) Mover fuera del repo** — los muevo a `~/bolg-brand-archive/` (local, no se trackea). En la app solo quedan los SVG/PNG que el sitio realmente usa.

Avísame cuál antes de hacer push (default: B, más prudente para B2B).

---

## 1. GitHub repo

### Tú (1 click):
```bash
cd /Users/benja/bolg-corporativo
gh repo create bolg-corporativo --public --source=. --description "Plataforma B2B de cotización corporativa de BØLG"
```

Eso crea el repo en `github.com/benjacuerosvaliz-ai/bolg-corporativo` y agrega el remote. **NO empuja** todavía.

Después:
```bash
git push -u origin main
```

### Verificación
Abre el repo en GitHub. Deberías ver los 7 commits con autor `Benja Donoso <benja.cuerosvaliz@gmail.com>`.

---

## 2. Vercel — primer deploy

### Tú (UI flow):
1. https://vercel.com/new
2. **Import Git Repository** → selecciona `benjacuerosvaliz-ai/bolg-corporativo`
3. **Framework Preset**: Next.js (auto-detect)
4. **Root Directory**: `./` (default)
5. **Build Command**: `npm run build` (default)
6. **Environment Variables** (por ahora pega solo estas, el resto las agregamos en paso 7):
   ```
   USE_MOCK_PRODUCTS=true
   SHOPIFY_STORE_DOMAIN=fe10b8-2.myshopify.com
   SHOPIFY_STOREFRONT_API_TOKEN=b99b4259903a856378b63fa7d02ab65d
   SHOPIFY_API_VERSION=2025-01
   NEXT_PUBLIC_SITE_URL=https://corporativo.bolg.cl
   ```
7. **Deploy** — toma 2-3 min.

### Verificación
Abre la URL temporal `bolg-corporativo-<hash>.vercel.app`. Debes ver la landing + catálogo con los 3 productos mock. La PDP debe funcionar end-to-end (cantidad, técnica, stock, Konva).

Si algo falla → me pasas el log del build y lo debuggemos.

---

## 3. Cloudflare DNS — corporativo.bolg.cl

Vercel da 2 opciones de configuración. Lo más limpio:

### Tú (Cloudflare panel):
1. https://dash.cloudflare.com → `bolg.cl` → DNS
2. **Add record**:
   - **Type**: `CNAME`
   - **Name**: `corporativo`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: **DNS only** (gris, no proxy naranja — Vercel maneja su propio CDN)
   - **TTL**: Auto

3. En Vercel → tu proyecto → Settings → Domains → Add → `corporativo.bolg.cl`
   - Vercel detectará el CNAME y emitirá el certificado SSL automáticamente.
   - Toma 30s-2min.

### Verificación
- `dig corporativo.bolg.cl` debe resolver a CNAME de Vercel.
- Abrir https://corporativo.bolg.cl debe mostrar la misma app que la URL temporal de Vercel.

---

## 4. Shopify Admin token

### Tú (Shopify Admin):
1. https://admin.shopify.com → Settings → **Apps and sales channels**
2. **Develop apps** (arriba a la derecha) → **Allow custom app development** si nunca lo habías habilitado.
3. **Create an app** → Name: `BØLG Corporativo`
4. **Configure Admin API scopes**, marca:
   - `read_products`
   - `read_inventory`
   - `read_locations`
   - `write_draft_orders`
   - `read_orders`
5. **Install app** → confirma.
6. Tab **API credentials** → reveal **Admin API access token** (empieza con `shpat_`).
7. Pega en `.env.local`:
   ```
   SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

⚠️ **NO commitees** este valor. `.env.local` ya está gitignored.

---

## 5. Shopify — metafield definitions

### Tú (1 comando):
```bash
cd /Users/benja/bolg-corporativo
npm run setup:shopify
```

Eso crea las 7 metafield definitions del namespace `corporate` (eligible, min_qty, lead_time_days_reorder, base_cost_usd, volume_pricing, print_areas, print_techniques) con visibilidad Storefront API. Idempotente — si ya existen las salta.

### Tú (luego, en Shopify Admin):
Configurar **valores** producto-por-producto:
1. Admin → Products → seleccionar producto con tag CORPORATIVO (ej: "Mochila Berlin Personalizada - Black")
2. Scroll abajo → sección **Metafields** → llenar cada uno.
3. Ejemplos de JSON para `volume_pricing`, `print_areas`, `print_techniques` en [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md).

**Mínimo para arrancar**: configurar 1 producto completo. Una vez listo, el resto se puede llenar en lote después.

---

## 6. Resend

### Tú (Resend UI):
1. https://resend.com/domains → **Add domain** → `bolg.cl`
2. Resend te da 3 registros DNS para agregar en Cloudflare:
   - `TXT @` → SPF
   - `TXT resend._domainkey` → DKIM
   - `MX send` → si quieres recibir bounces
3. Agregar los 3 registros en Cloudflare → DNS (Proxy = DNS only).
4. En Resend → **Verify Domain** (puede tardar 5-15 min en propagar).
5. Una vez verificado → **API Keys** → **Create API Key** → name `bolg-corporativo-prod`, permiso `Sending access`.
6. Copiar el key (empieza con `re_`).

### Tú (Vercel):
Agregar a Environment Variables del proyecto:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=cotizaciones@bolg.cl
RESEND_INTERNAL_EMAIL=corporativo@bolg.cl
```

---

## 7. Vercel KV + Blob

### Tú (Vercel Storage):
1. Vercel → tu proyecto → **Storage** tab
2. **Create Database** → **Upstash KV (Redis)** (Hobby tier gratis hasta 30K commands/día — suficiente para empezar)
3. **Create** → conecta automáticamente al proyecto. Vercel auto-popula `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` en las env vars.
4. **Create Database** otra vez → **Blob** → mismo flow. Auto-popula `BLOB_READ_WRITE_TOKEN`.

### Tú (genera AUTH_SECRET):
```bash
openssl rand -base64 32
```
Copia el output y pégalo en Vercel env vars como `AUTH_SECRET=...`.

---

## 8. Trigger redeploy con todas las vars

Después de agregar las env vars de los pasos 6-7, fuerza un redeploy:
- Vercel → Deployments → último deployment → menú `...` → **Redeploy**.

---

## 9. Switch a Shopify real

Una vez tengas al menos 1 producto con metafields completos (paso 5):

### Tú (Vercel):
- Settings → Environment Variables → editar `USE_MOCK_PRODUCTS` → cambiar a `false`.
- Settings → Deployments → Redeploy.

### Verificación
- https://corporativo.bolg.cl/catalogo debe mostrar tus productos reales (Mochila Berlin, Namibia, Annapurna, New York 2.0) en vez de los 3 mocks.
- Si un producto tagged CORPORATIVO no tiene metafields configurados, la PDP va a tirar un error explícito indicando exactamente qué falta. Eso es intencional — preferimos error visible a defaults silenciosos que cobren precios incorrectos.

---

## Resumen visual

```
┌────────────────────────────────────────────────────────────────────┐
│  PASO              QUIÉN     DURACIÓN     BLOQUEA                  │
├────────────────────────────────────────────────────────────────────┤
│  1. GitHub repo    Tú        2 min        Vercel                   │
│  2. Vercel deploy  Tú+Auto   5 min        DNS, env vars            │
│  3. Cloudflare DNS Tú        5 min + TTL  Dominio público         │
│  4. Admin token    Tú        10 min       Setup script, KV         │
│  5. Metafields     Auto+Tú   5 min script + 15 min config producto │
│  6. Resend         Tú        15 min (DNS) Fase 5                   │
│  7. KV + Blob      Tú+Auto   3 min        Fase 2e en adelante      │
│  8. Redeploy       Tú        2 min        —                        │
│  9. Switch flag    Tú        1 min        Producción real          │
└────────────────────────────────────────────────────────────────────┘
```

Total cargo de trabajo ≈ 1 hora de clicks/DNS, distribuible.

---

## Cosas a no olvidar

- **NO commits con `.env.local`** — está gitignored, verificalo con `git status` antes de cada push.
- **AUTH_SECRET es secreto** — si lo expones, regenéralo y rota.
- **El Admin token de Shopify es muy poderoso** — solo en `.env.local` y en Vercel env vars como SECRET.
- **Cuando agregues productos nuevos al catálogo corporativo**: solo necesitas (1) tag CORPORATIVO y (2) los 7 metafields. No tocar código.
- **Si Cloudflare proxy queda en naranja** (proxied), Vercel no puede emitir SSL. Asegúrate que sea gris (DNS only).
