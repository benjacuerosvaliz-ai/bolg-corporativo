import type { CorporateProduct, PrintArea, PrintTechnique } from "./types";

/**
 * Mock data para desarrollar antes de configurar metafields en Shopify.
 *
 * Activado con USE_MOCK_PRODUCTS=true. Los nombres usan prefijo "MOCK ·"
 * a propósito para que sea obvio en preview que NO son productos reales.
 * Los productos reales de BOLG vienen del Storefront API una vez que el
 * team configure el tag CORPORATIVO + metafields corporate.* en cada
 * producto del catálogo.
 *
 * Schema idéntico al de CorporateProduct para que el switch a Shopify
 * real sea solo en el cliente storefront.ts.
 */

const SERIGRAFIA_1C: PrintTechnique = {
  id: "serigrafia_1c",
  label: "Serigrafía 1 color",
  description:
    "Económica y duradera. Ideal para logos sólidos de 1 a 2 colores planos sobre superficies textiles.",
  basePriceUnit: 890,
  extraPositionPrice: 590,
  setupFee: 35000,
  extraLeadDays: 7,
  availableAreaIds: ["frente", "lateral", "espalda"],
};

const SERIGRAFIA_FULL: PrintTechnique = {
  id: "serigrafia_full",
  label: "Serigrafía full color",
  description: "Para logos con degradados o múltiples colores. Mayor setup, mejor fidelidad cromática.",
  basePriceUnit: 1690,
  extraPositionPrice: 990,
  setupFee: 75000,
  extraLeadDays: 10,
  availableAreaIds: ["frente", "espalda"],
};

const BORDADO: PrintTechnique = {
  id: "bordado",
  label: "Bordado",
  description: "Acabado premium en tela. Ideal para logos pequeños y medianos. Mayor durabilidad.",
  basePriceUnit: 2490,
  extraPositionPrice: 1490,
  setupFee: 45000,
  extraLeadDays: 10,
  availableAreaIds: ["frente", "lateral"],
};

const TRANSFER_DTF: PrintTechnique = {
  id: "transfer_dtf",
  label: "Transfer DTF",
  description: "Full color en cualquier tela. Buen detalle, sin setup fee. Recomendado para tirajes medianos.",
  basePriceUnit: 1290,
  extraPositionPrice: 790,
  setupFee: 0,
  extraLeadDays: 5,
  availableAreaIds: ["frente", "espalda", "lateral", "asa"],
};

const LASER: PrintTechnique = {
  id: "laser",
  label: "Grabado láser",
  description: "Para botellas y accesorios metálicos. Acabado permanente y muy elegante.",
  basePriceUnit: 990,
  extraPositionPrice: 690,
  setupFee: 25000,
  extraLeadDays: 5,
  availableAreaIds: ["frente", "lateral"],
};

function placeholderImage(label: string, width = 1200, height = 1200): {
  url: string;
  altText: string;
  width: number;
  height: number;
} {
  const text = encodeURIComponent(label);
  return {
    url: `https://placehold.co/${width}x${height}/0f0f0f/ffffff/png?text=${text}`,
    altText: label,
    width,
    height,
  };
}

const AREA_FRENTE = (label: string): PrintArea => ({
  id: "frente",
  label,
  imageUrl: placeholderImage(`${label}`, 1200, 1200).url,
  areaPolygon: [
    [400, 500],
    [800, 500],
    [800, 850],
    [400, 850],
  ],
  maxWidthCm: 12,
  maxHeightCm: 10,
  pxPerCm: 33,
});

const AREA_LATERAL = (label: string): PrintArea => ({
  id: "lateral",
  label,
  imageUrl: placeholderImage(`${label}`, 1200, 1200).url,
  areaPolygon: [
    [300, 450],
    [650, 450],
    [650, 700],
    [300, 700],
  ],
  maxWidthCm: 8,
  maxHeightCm: 6,
  pxPerCm: 40,
});

export const mockCorporateProducts: CorporateProduct[] = [
  {
    id: "mock_mochila_01",
    handle: "mock-mochila-estandar",
    title: "MOCK · Mochila Estándar",
    vendor: "BOLG",
    category: "Mochilas",
    description:
      "Mochila urbana mock para desarrollar el configurador. Reemplazar con producto real cuando los metafields estén configurados.",
    descriptionHtml:
      "<p>Mochila urbana mock para desarrollar el configurador. Reemplazar con producto real cuando los metafields estén configurados.</p>",
    featuredImage: placeholderImage("Mochila"),
    images: [placeholderImage("Mochila Frente"), placeholderImage("Mochila Lateral")],
    variants: [
      {
        id: "mock_var_mochila_negro_high",
        title: "Negro",
        sku: "MOCK-MOCH-NG",
        selectedOptions: [{ name: "Color", value: "Negro" }],
        priceRetail: { amount: 39990, currencyCode: "CLP" },
        image: placeholderImage("Mochila Negro"),
        availableForSale: true,
      },
      {
        id: "mock_var_mochila_gris_high",
        title: "Gris",
        sku: "MOCK-MOCH-GR",
        selectedOptions: [{ name: "Color", value: "Gris" }],
        priceRetail: { amount: 39990, currencyCode: "CLP" },
        image: placeholderImage("Mochila Gris"),
        availableForSale: true,
      },
    ],
    minQty: 50,
    leadTimeDaysReorder: 75,
    baseCostUsd: 12.5,
    volumePricing: [
      { minQty: 50, unitPriceNet: 18990 },
      { minQty: 100, unitPriceNet: 16990 },
      { minQty: 250, unitPriceNet: 14990 },
      { minQty: 500, unitPriceNet: 12990 },
      { minQty: 1000, unitPriceNet: 11490 },
    ],
    printAreas: [AREA_FRENTE("Mochila Frente"), AREA_LATERAL("Mochila Lateral")],
    printTechniques: [SERIGRAFIA_1C, SERIGRAFIA_FULL, BORDADO, TRANSFER_DTF],
    tags: ["CORPORATIVO", "mochila", "mock"],
  },
  {
    id: "mock_botella_01",
    handle: "mock-botella-acero",
    title: "MOCK · Botella Acero 500ml",
    vendor: "BOLG",
    category: "Botellas",
    description:
      "Botella mock para desarrollar el configurador con grabado láser. Reemplazar con producto real.",
    descriptionHtml:
      "<p>Botella mock para desarrollar el configurador con grabado láser. Reemplazar con producto real.</p>",
    featuredImage: placeholderImage("Botella"),
    images: [placeholderImage("Botella Frente"), placeholderImage("Botella Lateral")],
    variants: [
      {
        id: "mock_var_bot_negro_low",
        title: "Negro Mate",
        sku: "MOCK-BOT-NG",
        selectedOptions: [{ name: "Color", value: "Negro Mate" }],
        priceRetail: { amount: 22990, currencyCode: "CLP" },
        image: placeholderImage("Botella Negro"),
        availableForSale: true,
      },
      {
        id: "mock_var_bot_blanco_low",
        title: "Blanco",
        sku: "MOCK-BOT-BL",
        selectedOptions: [{ name: "Color", value: "Blanco" }],
        priceRetail: { amount: 22990, currencyCode: "CLP" },
        image: placeholderImage("Botella Blanco"),
        availableForSale: true,
      },
    ],
    minQty: 100,
    leadTimeDaysReorder: 70,
    baseCostUsd: 6.8,
    volumePricing: [
      { minQty: 100, unitPriceNet: 10990 },
      { minQty: 250, unitPriceNet: 9490 },
      { minQty: 500, unitPriceNet: 7990 },
      { minQty: 1000, unitPriceNet: 6890 },
    ],
    printAreas: [AREA_FRENTE("Botella Frente"), AREA_LATERAL("Botella Lateral")],
    printTechniques: [LASER, SERIGRAFIA_1C],
    tags: ["CORPORATIVO", "botella", "mock"],
  },
  {
    id: "mock_polera_01",
    handle: "mock-polera-algodon",
    title: "MOCK · Polera Algodón",
    vendor: "BOLG",
    category: "Vestuario",
    description:
      "Polera mock para desarrollar DTF y serigrafía full color. Reemplazar con producto real.",
    descriptionHtml:
      "<p>Polera mock para desarrollar DTF y serigrafía full color. Reemplazar con producto real.</p>",
    featuredImage: placeholderImage("Polera"),
    images: [placeholderImage("Polera Frente"), placeholderImage("Polera Espalda")],
    variants: [
      {
        id: "mock_var_pol_negro_high",
        title: "Negro / M",
        sku: "MOCK-POL-NG-M",
        selectedOptions: [
          { name: "Color", value: "Negro" },
          { name: "Talla", value: "M" },
        ],
        priceRetail: { amount: 14990, currencyCode: "CLP" },
        image: placeholderImage("Polera Negro M"),
        availableForSale: true,
      },
      {
        id: "mock_var_pol_blanco_high",
        title: "Blanco / M",
        sku: "MOCK-POL-BL-M",
        selectedOptions: [
          { name: "Color", value: "Blanco" },
          { name: "Talla", value: "M" },
        ],
        priceRetail: { amount: 14990, currencyCode: "CLP" },
        image: placeholderImage("Polera Blanco M"),
        availableForSale: true,
      },
    ],
    minQty: 50,
    leadTimeDaysReorder: 60,
    baseCostUsd: 4.2,
    volumePricing: [
      { minQty: 50, unitPriceNet: 7990 },
      { minQty: 100, unitPriceNet: 6890 },
      { minQty: 250, unitPriceNet: 5890 },
      { minQty: 500, unitPriceNet: 4990 },
    ],
    printAreas: [AREA_FRENTE("Polera Frente"), AREA_LATERAL("Polera Espalda")],
    printTechniques: [SERIGRAFIA_1C, SERIGRAFIA_FULL, TRANSFER_DTF, BORDADO],
    tags: ["CORPORATIVO", "vestuario", "mock"],
  },
];

export function mockProductByHandle(handle: string): CorporateProduct | null {
  return mockCorporateProducts.find((p) => p.handle === handle) ?? null;
}
