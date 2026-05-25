# Setup de Shopify para BØLG Corporativo

Esta plataforma vive sobre el Shopify de BØLG (`fe10b8-2.myshopify.com`) headless. Single source of truth = Shopify. Aquí está cómo dejar todo configurado para apagar el mock y conectar la plataforma corporativa a productos reales.

## 1. Storefront API token (ya configurado)

- Domain: `fe10b8-2.myshopify.com`
- Token público (server-side use): guardado en `.env.local` como `SHOPIFY_STOREFRONT_API_TOKEN`.
- Permisos requeridos: lectura de productos, metafields públicos.

Verificación: `curl` al endpoint con el header `X-Shopify-Storefront-Access-Token` debe devolver `shop.name = "BØLG Concept"`.

## 2. Tag CORPORATIVO (ya aplicado)

Hay 5+ productos en Shopify con el tag `CORPORATIVO`. La query `tag:CORPORATIVO` los lista correctamente. Para agregar más productos al catálogo corporativo: editar el producto en Shopify Admin → Tags → agregar `CORPORATIVO`.

## 3. Metafields `corporate.*` (PENDIENTE)

Por configurar en cada producto taggeado CORPORATIVO. Todos del namespace `corporate`:

| Key | Type | Ejemplo | Para qué |
|---|---|---|---|
| `eligible` | Boolean | `true` | Confirma que el producto se muestra en corporativo (alternativa al tag). |
| `min_qty` | Integer | `50` | Mínimo de cotización corporativa. |
| `lead_time_days_reorder` | Integer | `75` | Días desde re-order al proveedor hasta llegada a Chile. |
| `base_cost_usd` | Decimal | `12.50` | Costo base USD (cálculos internos de re-order). |
| `volume_pricing` | JSON string | ver abajo | Tabla de breaks de precio por volumen. |
| `print_areas` | JSON string | ver abajo | Zonas de impresión disponibles con polígonos y cm. |
| `print_techniques` | JSON string | ver abajo | Técnicas disponibles con costo y tiempo. |

### Setup de metafields en Shopify Admin

1. Settings → Custom data → Products → Add definition
2. Namespace: `corporate`, Key: una de las de arriba, Type: el correspondiente.
3. **Importante**: Marca "Storefronts" en "Access" para que el Storefront API pueda leer el valor.

### Ejemplo `corporate.volume_pricing`

```json
[
  { "minQty": 50,  "unitPriceNet": 18990 },
  { "minQty": 100, "unitPriceNet": 16990 },
  { "minQty": 250, "unitPriceNet": 14990 },
  { "minQty": 500, "unitPriceNet": 12990 },
  { "minQty": 1000, "unitPriceNet": 11490 }
]
```

### Ejemplo `corporate.print_areas`

```json
[
  {
    "id": "frente",
    "label": "Bolsillo frontal",
    "imageUrl": "https://cdn.shopify.com/.../mochila-frente.png",
    "areaPolygon": [[120, 200], [380, 200], [380, 380], [120, 380]],
    "maxWidthCm": 12,
    "maxHeightCm": 10,
    "pxPerCm": 22
  },
  {
    "id": "lateral",
    "label": "Lateral derecho",
    "imageUrl": "https://cdn.shopify.com/.../mochila-lateral.png",
    "areaPolygon": [[100, 150], [320, 150], [320, 300], [100, 300]],
    "maxWidthCm": 8,
    "maxHeightCm": 6,
    "pxPerCm": 25
  }
]
```

### Ejemplo `corporate.print_techniques`

```json
[
  {
    "id": "serigrafia_1c",
    "label": "Serigrafía 1 color",
    "description": "Económica y duradera. Ideal para logos sólidos de 1 a 2 colores planos sobre superficies textiles.",
    "basePriceUnit": 890,
    "extraPositionPrice": 590,
    "setupFee": 35000,
    "extraLeadDays": 7,
    "availableAreaIds": ["frente", "lateral"]
  },
  {
    "id": "bordado",
    "label": "Bordado",
    "description": "Acabado premium en tela.",
    "basePriceUnit": 2490,
    "extraPositionPrice": 1490,
    "setupFee": 45000,
    "extraLeadDays": 10,
    "availableAreaIds": ["frente"]
  }
]
```

## 4. Admin API token (PENDIENTE)

Necesario para:
- Stock real en tiempo real (con buffer de reserva retail).
- Creación de Draft Orders cuando una cotización pasa a ventas (Fase 6).

### Cómo conseguirlo

1. Shopify Admin → **Settings** → **Apps and sales channels**
2. **Develop apps** (arriba a la derecha) → **Allow custom app development** si nunca lo habías habilitado.
3. **Create an app** → Name: `BØLG Corporativo`
4. **Configure Admin API scopes**, marca:
   - `read_products`
   - `read_inventory`
   - `read_locations`
   - `write_draft_orders` (para Fase 6)
   - `read_orders`
5. **Install app** → confirma.
6. Tab **API credentials** → **Admin API access token** → reveal once, copiar.
7. Pegar en `.env.local` como `SHOPIFY_ADMIN_API_TOKEN=`.

**Token empieza con `shpat_`.** Es secreto — NO commitear, NO compartir en frontend.

## 5. Switch del flag mock → real

Una vez configurados los metafields en al menos 1-2 productos:

```bash
# .env.local
USE_MOCK_PRODUCTS=false
```

Reiniciar el dev server. El catálogo pasa a listar los productos reales de Shopify. Si algún producto taggeado CORPORATIVO no tiene los metafields requeridos, la app va a tirar un error explícito indicando exactamente qué falta — diseñado así a propósito (no rellenamos con defaults para evitar cobrar precios incorrectos al cliente).

Mientras tanto, el sistema funciona contra `lib/shopify/mock.ts` con 3 productos genéricos de demo.
