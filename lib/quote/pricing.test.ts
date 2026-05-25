import { describe, it, expect } from "vitest";
import { calculateLinePricing } from "./pricing";
import type {
  CorporateProduct,
  PrintTechnique,
  VolumeBreak,
} from "@/lib/shopify/types";

// --- Fixtures ---------------------------------------------------------------

const BREAKS: VolumeBreak[] = [
  { minQty: 50, unitPriceNet: 10000 },
  { minQty: 100, unitPriceNet: 9000 },
  { minQty: 250, unitPriceNet: 7500 },
  { minQty: 500, unitPriceNet: 6000 },
];

const TECH_SERIGRAFIA: PrintTechnique = {
  id: "serigrafia_1c",
  label: "Serigrafía 1 color",
  description: "",
  basePriceUnit: 800,
  extraPositionPrice: 500,
  setupFee: 30000,
  extraLeadDays: 7,
  availableAreaIds: ["frente", "lateral"],
};

const TECH_DTF: PrintTechnique = {
  id: "transfer_dtf",
  label: "Transfer DTF",
  description: "",
  basePriceUnit: 1200,
  extraPositionPrice: 700,
  setupFee: 0,
  extraLeadDays: 5,
  availableAreaIds: ["frente"],
};

function makeProduct(volumePricing: VolumeBreak[] = BREAKS): CorporateProduct {
  return {
    id: "p1",
    handle: "p1",
    title: "Test product",
    vendor: "BØLG",
    category: "Mochilas",
    description: "",
    descriptionHtml: "",
    featuredImage: { url: "x", altText: null, width: 1, height: 1 },
    images: [],
    variants: [],
    minQty: 50,
    leadTimeDaysReorder: 70,
    baseCostUsd: 10,
    volumePricing,
    printAreas: [],
    printTechniques: [],
    tags: [],
  };
}

// --- Tests ------------------------------------------------------------------

describe("calculateLinePricing", () => {
  describe("volume breaks", () => {
    it("aplica el primer break con cantidad exacta", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 50,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.appliedBreak.minQty).toBe(50);
      expect(r.appliedBreak.unitPriceNet).toBe(10000);
    });

    it("aplica el break intermedio con cantidad entre breaks", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 175,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.appliedBreak.minQty).toBe(100);
      expect(r.appliedBreak.unitPriceNet).toBe(9000);
    });

    it("aplica el último break con cantidad sobre el máximo", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 1500,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.appliedBreak.minQty).toBe(500);
      expect(r.appliedBreak.unitPriceNet).toBe(6000);
      expect(r.nextBreak).toBeNull();
    });

    it("con cantidad bajo el primer break, usa el primer break como fallback", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 30,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.appliedBreak.minQty).toBe(50);
    });

    it("expone el próximo break con su ahorro al subir", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 60,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.nextBreak).not.toBeNull();
      expect(r.nextBreak?.minQty).toBe(100);
      expect(r.nextBreak?.unitPriceNet).toBe(9000);
      // Subiendo a 100u con el break 9000 vs 10000: ahorro = 100 * 1000 = 100.000
      expect(r.nextBreak?.savings).toBe(100_000);
    });
  });

  describe("técnica con setup fee", () => {
    it("incluye el setup fee en el subtotal", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_SERIGRAFIA,
        printPositions: 1,
      });
      // unit: 9000 + 800 = 9800. Subtotal: 100*9800 + setup 30000 = 1.010.000
      expect(r.unitPriceNet).toBe(9000);
      expect(r.customizationUnitPrice).toBe(800);
      expect(r.setupFee).toBe(30000);
      expect(r.subtotalNet).toBe(1_010_000);
    });

    it("técnica sin setup fee tiene setupFee = 0", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.setupFee).toBe(0);
      // 100 * (9000 + 1200) = 1.020.000
      expect(r.subtotalNet).toBe(1_020_000);
    });
  });

  describe("posiciones múltiples de impresión", () => {
    it("una sola posición no suma extra", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_SERIGRAFIA,
        printPositions: 1,
      });
      expect(r.customizationUnitPrice).toBe(800);
    });

    it("dos posiciones suma una extra al base", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_SERIGRAFIA,
        printPositions: 2,
      });
      // base 800 + 1 * extra 500 = 1300
      expect(r.customizationUnitPrice).toBe(1300);
    });

    it("tres posiciones suma dos extras", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_SERIGRAFIA,
        printPositions: 3,
      });
      expect(r.customizationUnitPrice).toBe(800 + 2 * 500);
    });
  });

  describe("IVA y total bruto", () => {
    it("aplica 19% sobre el neto", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 100,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.iva).toBeCloseTo(r.subtotalNet * 0.19, 2);
      expect(r.totalGross).toBeCloseTo(r.subtotalNet * 1.19, 2);
    });
  });

  describe("savingsVsBaseline", () => {
    it("es 0 al estar en el primer break", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 50,
        technique: TECH_DTF,
        printPositions: 1,
      });
      expect(r.savingsVsBaseline).toBe(0);
    });

    it("es positivo al estar en un break superior", () => {
      const r = calculateLinePricing({
        product: makeProduct(),
        quantity: 250,
        technique: TECH_DTF,
        printPositions: 1,
      });
      // baseline 10000 vs aplicado 7500. ahorro: 250 * 2500 = 625.000
      expect(r.savingsVsBaseline).toBe(625_000);
    });
  });

  describe("validaciones", () => {
    it("lanza si quantity es 0 o negativo", () => {
      expect(() =>
        calculateLinePricing({
          product: makeProduct(),
          quantity: 0,
          technique: TECH_DTF,
          printPositions: 1,
        }),
      ).toThrow(RangeError);
    });

    it("lanza si printPositions es 0", () => {
      expect(() =>
        calculateLinePricing({
          product: makeProduct(),
          quantity: 100,
          technique: TECH_DTF,
          printPositions: 0,
        }),
      ).toThrow(RangeError);
    });

    it("lanza si el producto no tiene volume pricing", () => {
      expect(() =>
        calculateLinePricing({
          product: makeProduct([]),
          quantity: 100,
          technique: TECH_DTF,
          printPositions: 1,
        }),
      ).toThrow();
    });
  });
});
