import type {
  CorporateProduct,
  PrintTechnique,
  VolumeBreak,
} from "@/lib/shopify/types";
import { IVA_RATE } from "@/lib/utils/money";
import type { LinePricing } from "./types";

export type PricingInput = {
  product: CorporateProduct;
  quantity: number;
  technique: PrintTechnique;
  /** Cantidad de zonas de impresión donde se aplica el logo. ≥ 1. */
  printPositions: number;
};

/**
 * Calcula el pricing de una línea de cotización a partir de:
 *  - El break aplicable según volumen.
 *  - La técnica de impresión (base + extra por posición + setup fee).
 *  - IVA chileno 19%.
 *
 * Devuelve también:
 *  - El próximo break (si existe) y cuánto ahorra el cliente si sube.
 *  - El ahorro vs el primer break (sin descuento por volumen).
 *
 * Función pura: solo lee los inputs, no toca red, KV ni nada externo.
 * Útil para llamarla desde Server Components y desde tests con Vitest.
 */
export function calculateLinePricing(input: PricingInput): LinePricing {
  const { product, quantity, technique, printPositions } = input;

  if (quantity <= 0) {
    throw new RangeError("La cantidad debe ser positiva.");
  }
  if (printPositions < 1) {
    throw new RangeError("Debe haber al menos una zona de impresión.");
  }

  const sortedBreaks = [...product.volumePricing].sort(
    (a, b) => a.minQty - b.minQty,
  );

  const baselineBreak = sortedBreaks[0];
  if (!baselineBreak) {
    throw new Error(
      `El producto ${product.handle} no tiene volume_pricing configurado.`,
    );
  }

  const appliedBreak = findApplicableBreak(sortedBreaks, quantity);
  const nextBreak = findNextBreak(sortedBreaks, appliedBreak);

  const unitPriceNet = appliedBreak.unitPriceNet;
  const extraPositions = Math.max(0, printPositions - 1);
  const customizationUnitPrice =
    technique.basePriceUnit + extraPositions * technique.extraPositionPrice;
  const setupFee = technique.setupFee;

  const subtotalNet =
    quantity * (unitPriceNet + customizationUnitPrice) + setupFee;
  const iva = subtotalNet * IVA_RATE;
  const totalGross = subtotalNet + iva;

  const savingsVsBaseline =
    quantity * Math.max(0, baselineBreak.unitPriceNet - unitPriceNet);

  return {
    unitPriceNet,
    customizationUnitPrice,
    setupFee,
    subtotalNet,
    iva,
    totalGross,
    appliedBreak: {
      minQty: appliedBreak.minQty,
      unitPriceNet: appliedBreak.unitPriceNet,
    },
    nextBreak: nextBreak
      ? {
          minQty: nextBreak.minQty,
          unitPriceNet: nextBreak.unitPriceNet,
          savings: savingsAtNextBreak({
            currentBreak: appliedBreak,
            nextBreak,
            customizationUnitPrice,
            setupFee,
          }),
        }
      : null,
    savingsVsBaseline,
  };
}

/**
 * Encuentra el break aplicable: el de mayor minQty que aún sea ≤ quantity.
 * Si la cantidad es menor al primer break, retorna el primer break (con su
 * unitPrice) como fallback — la UI debe advertir que está bajo el mínimo,
 * pero el cálculo no debe romperse.
 */
function findApplicableBreak(
  sortedBreaks: VolumeBreak[],
  quantity: number,
): VolumeBreak {
  let applied: VolumeBreak | undefined;
  for (const b of sortedBreaks) {
    if (b.minQty <= quantity) {
      applied = b;
    } else {
      break;
    }
  }
  // Si quantity < primer break (ej. cliente puso 30 cuando mínimo es 50),
  // usamos el primer break como aproximación.
  return applied ?? sortedBreaks[0]!;
}

function findNextBreak(
  sortedBreaks: VolumeBreak[],
  current: VolumeBreak,
): VolumeBreak | undefined {
  const idx = sortedBreaks.findIndex((b) => b.minQty === current.minQty);
  if (idx === -1) return undefined;
  return sortedBreaks[idx + 1];
}

/**
 * Ahorro AT (en el momento) si el cliente subiera la cantidad al próximo break.
 * Comparamos el costo total con la cantidad actual vs el costo total con
 * la cantidad mínima del próximo break (ambos con el precio del nuevo break).
 *
 * Esto es útil para mostrar: "Sube a 100 unidades y ahorras $X totales".
 * El "ahorro" puede ser negativo (sube unidades = sube total). El consumer
 * de este número debe decidir cómo presentarlo.
 */
function savingsAtNextBreak(args: {
  currentBreak: VolumeBreak;
  nextBreak: VolumeBreak;
  customizationUnitPrice: number;
  setupFee: number;
}): number {
  const { currentBreak, nextBreak, customizationUnitPrice, setupFee } = args;
  const qtyAtNext = nextBreak.minQty;
  const totalAtCurrent =
    qtyAtNext * (currentBreak.unitPriceNet + customizationUnitPrice) + setupFee;
  const totalAtNext =
    qtyAtNext * (nextBreak.unitPriceNet + customizationUnitPrice) + setupFee;
  return Math.max(0, totalAtCurrent - totalAtNext);
}
