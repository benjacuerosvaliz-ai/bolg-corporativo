import { describe, it, expect } from "vitest";
import { analyzeStock } from "./stock-analysis";

const TODAY = new Date("2026-06-01T00:00:00");

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

describe("analyzeStock", () => {
  describe("ALL_IN_STOCK", () => {
    it("clasifica como ALL_IN_STOCK cuando hay stock suficiente", () => {
      const r = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.scenario).toBe("ALL_IN_STOCK");
      expect(r.stockReady).toBe(200);
      expect(r.stockMissing).toBe(0);
      expect(r.reorderNeeded).toBe(false);
      expect(r.reorderArrivalDate).toBeNull();
    });

    it("entrega = hoy + personalización + despacho", () => {
      const r = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 100,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      // Entrega = TODAY + 10 + 5 = TODAY + 15
      const expected = addDays(TODAY, 15);
      expect(r.finalDeliveryDate.getTime()).toBe(expected.getTime());
      // Buffer = 60 - 15 = 45 días
      expect(r.bufferDays).toBe(45);
    });
  });

  describe("HYBRID_FEASIBLE", () => {
    it("clasifica con stock parcial y fecha amplia", () => {
      const r = analyzeStock({
        inventoryAvailable: 100,
        requiredQuantity: 300,
        requiredDate: addDays(TODAY, 120),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.scenario).toBe("HYBRID_FEASIBLE");
      expect(r.stockReady).toBe(100);
      expect(r.stockMissing).toBe(200);
      expect(r.reorderNeeded).toBe(true);
      expect(r.reorderArrivalDate?.getTime()).toBe(addDays(TODAY, 70).getTime());
      // Entrega = 70 + 10 + 5 = 85 días. Buffer = 120 - 85 = 35.
      expect(r.bufferDays).toBe(35);
    });
  });

  describe("HYBRID_TIGHT", () => {
    it("clasifica como TIGHT cuando buffer < 7 días", () => {
      const r = analyzeStock({
        inventoryAvailable: 50,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 88),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      // Entrega = 85 días. Buffer = 88 - 85 = 3 → TIGHT
      expect(r.scenario).toBe("HYBRID_TIGHT");
      expect(r.bufferDays).toBe(3);
    });

    it("threshold exclusivo: buffer = 7 es FEASIBLE, no TIGHT", () => {
      const r = analyzeStock({
        inventoryAvailable: 50,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 92),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.bufferDays).toBe(7);
      expect(r.scenario).toBe("HYBRID_FEASIBLE");
    });
  });

  describe("INFEASIBLE", () => {
    it("clasifica como INFEASIBLE cuando la entrega cae después de la fecha", () => {
      const r = analyzeStock({
        inventoryAvailable: 50,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 40),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      // Entrega = 85 días. Required = 40. Buffer = -45 → INFEASIBLE
      expect(r.scenario).toBe("INFEASIBLE");
      expect(r.bufferDays).toBeLessThan(0);
    });

    it("también es INFEASIBLE si con stock completo la fecha igual no alcanza", () => {
      const r = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 5),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      // Sin reorder, pero entrega = 15 días, fecha 5 → INFEASIBLE
      expect(r.scenario).toBe("INFEASIBLE");
    });
  });

  describe("recomendación", () => {
    it("ALL_IN_STOCK menciona unidades y holgura", () => {
      const r = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 100,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.recommendation).toMatch(/100/);
      expect(r.recommendation).toMatch(/listas/);
    });

    it("HYBRID_FEASIBLE menciona lead time y holgura positiva", () => {
      const r = analyzeStock({
        inventoryAvailable: 100,
        requiredQuantity: 300,
        requiredDate: addDays(TODAY, 120),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.recommendation).toMatch(/reposición/);
      expect(r.recommendation).toMatch(/70 días/);
      expect(r.recommendation).toMatch(/holgura/);
    });

    it("INFEASIBLE ofrece opciones alternativas", () => {
      const r = analyzeStock({
        inventoryAvailable: 50,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 5),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r.recommendation).toMatch(/asesor|reducir|mover/i);
    });
  });

  describe("Gantt", () => {
    it("ALL_IN_STOCK incluye stock_ready + personalization + shipping", () => {
      const r = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 100,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      const kinds = r.ganttSegments.map((s) => s.kind);
      expect(kinds).toContain("stock_ready");
      expect(kinds).toContain("personalization");
      expect(kinds).toContain("shipping");
      expect(kinds).not.toContain("reorder");
    });

    it("HYBRID incluye reorder en lugar de stock_ready", () => {
      const r = analyzeStock({
        inventoryAvailable: 50,
        requiredQuantity: 200,
        requiredDate: addDays(TODAY, 120),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      const kinds = r.ganttSegments.map((s) => s.kind);
      expect(kinds).toContain("reorder");
      expect(kinds).toContain("personalization");
      expect(kinds).toContain("shipping");
    });
  });

  describe("validaciones", () => {
    it("lanza si requiredQuantity es 0", () => {
      expect(() =>
        analyzeStock({
          inventoryAvailable: 100,
          requiredQuantity: 0,
          requiredDate: addDays(TODAY, 60),
          leadTimeDaysReorder: 70,
          personalizationDays: 10,
          today: TODAY,
        }),
      ).toThrow(RangeError);
    });

    it("lanza si inventoryAvailable es negativo", () => {
      expect(() =>
        analyzeStock({
          inventoryAvailable: -5,
          requiredQuantity: 100,
          requiredDate: addDays(TODAY, 60),
          leadTimeDaysReorder: 70,
          personalizationDays: 10,
          today: TODAY,
        }),
      ).toThrow(RangeError);
    });
  });

  describe("default shippingDays", () => {
    it("usa 5 días por defecto si no se pasa", () => {
      const r1 = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 100,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        today: TODAY,
      });
      const r2 = analyzeStock({
        inventoryAvailable: 500,
        requiredQuantity: 100,
        requiredDate: addDays(TODAY, 60),
        leadTimeDaysReorder: 70,
        personalizationDays: 10,
        shippingDays: 5,
        today: TODAY,
      });
      expect(r1.finalDeliveryDate.getTime()).toBe(r2.finalDeliveryDate.getTime());
    });
  });
});
