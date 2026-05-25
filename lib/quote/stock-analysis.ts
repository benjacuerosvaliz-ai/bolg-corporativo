/**
 * Engine de análisis de stock + timeline.
 *
 * Función pura. La integración real con Shopify Admin API se hace en el
 * call site (Server Component / Server Action), que pasa el inventory
 * disponible para corporativo (ya con buffer aplicado). Esto deja la
 * lógica de timeline 100% testeable sin red.
 */

export type StockScenario =
  | "ALL_IN_STOCK"
  | "HYBRID_FEASIBLE"
  | "HYBRID_TIGHT"
  | "INFEASIBLE";

/** Threshold de días de holgura por debajo del cual la entrega es "apretada". */
const TIGHT_BUFFER_THRESHOLD_DAYS = 7;
/** Días por defecto de despacho desde fábrica al cliente final. */
const DEFAULT_SHIPPING_DAYS = 5;

export type StockAnalysisInput = {
  /** Stock disponible para B2B (con buffer ya descontado). */
  inventoryAvailable: number;
  requiredQuantity: number;
  /** Fecha objetivo de entrega del cliente. */
  requiredDate: Date;
  /** Días desde re-order al proveedor hasta llegada a Chile. */
  leadTimeDaysReorder: number;
  /** Días de producción + personalización según técnica elegida. */
  personalizationDays: number;
  /** Días de despacho. Default 5. */
  shippingDays?: number;
  /** Hoy. Inyectable para tests deterministas. Default new Date(). */
  today?: Date;
};

export type GanttSegment = {
  kind: "stock_ready" | "reorder" | "personalization" | "shipping";
  label: string;
  startDate: Date;
  endDate: Date;
};

export type StockAnalysis = {
  scenario: StockScenario;
  stockReady: number;
  stockMissing: number;
  reorderNeeded: boolean;
  reorderArrivalDate: Date | null;
  /** Fecha estimada en que el cliente recibe el pedido. */
  finalDeliveryDate: Date;
  /** Días de holgura entre finalDeliveryDate y requiredDate. Negativo = no llega. */
  bufferDays: number;
  /** Texto humano en español Chile (tono profesional, cercano). */
  recommendation: string;
  ganttSegments: GanttSegment[];
};

export function analyzeStock(input: StockAnalysisInput): StockAnalysis {
  if (input.requiredQuantity <= 0) {
    throw new RangeError("requiredQuantity debe ser positivo.");
  }
  if (input.inventoryAvailable < 0) {
    throw new RangeError("inventoryAvailable no puede ser negativo.");
  }

  const today = startOfDay(input.today ?? new Date());
  const required = startOfDay(input.requiredDate);
  const shippingDays = input.shippingDays ?? DEFAULT_SHIPPING_DAYS;

  const stockReady = Math.min(input.inventoryAvailable, input.requiredQuantity);
  const stockMissing = input.requiredQuantity - stockReady;
  const reorderNeeded = stockMissing > 0;

  let reorderArrivalDate: Date | null = null;
  let productionStartDate: Date;
  if (reorderNeeded) {
    reorderArrivalDate = addDays(today, input.leadTimeDaysReorder);
    productionStartDate = reorderArrivalDate;
  } else {
    productionStartDate = today;
  }

  const productionEndDate = addDays(productionStartDate, input.personalizationDays);
  const finalDeliveryDate = addDays(productionEndDate, shippingDays);
  const bufferDays = daysBetween(finalDeliveryDate, required);

  const scenario = pickScenario({ reorderNeeded, bufferDays });
  const recommendation = buildRecommendation({
    scenario,
    stockReady,
    stockMissing,
    requiredQuantity: input.requiredQuantity,
    requiredDate: required,
    finalDeliveryDate,
    bufferDays,
    leadTimeDaysReorder: input.leadTimeDaysReorder,
  });

  const ganttSegments = buildGantt({
    today,
    productionStartDate,
    productionEndDate,
    finalDeliveryDate,
    reorderArrivalDate,
    stockReady,
    stockMissing,
  });

  return {
    scenario,
    stockReady,
    stockMissing,
    reorderNeeded,
    reorderArrivalDate,
    finalDeliveryDate,
    bufferDays,
    recommendation,
    ganttSegments,
  };
}

function pickScenario(args: {
  reorderNeeded: boolean;
  bufferDays: number;
}): StockScenario {
  if (args.bufferDays < 0) return "INFEASIBLE";
  if (!args.reorderNeeded) return "ALL_IN_STOCK";
  if (args.bufferDays < TIGHT_BUFFER_THRESHOLD_DAYS) return "HYBRID_TIGHT";
  return "HYBRID_FEASIBLE";
}

function buildRecommendation(args: {
  scenario: StockScenario;
  stockReady: number;
  stockMissing: number;
  requiredQuantity: number;
  requiredDate: Date;
  finalDeliveryDate: Date;
  bufferDays: number;
  leadTimeDaysReorder: number;
}): string {
  const dateText = formatDateEsCL(args.requiredDate);
  const deliveryText = formatDateEsCL(args.finalDeliveryDate);

  switch (args.scenario) {
    case "ALL_IN_STOCK":
      return `Tenemos las ${args.requiredQuantity} unidades listas para personalizar. Entregamos el ${deliveryText}, con ${args.bufferDays} días de holgura respecto a tu fecha del ${dateText}.`;
    case "HYBRID_FEASIBLE":
      return `Tenemos ${args.stockReady} unidades en stock. Para completar las ${args.requiredQuantity} hacemos una reposición desde origen (lead time ~${args.leadTimeDaysReorder} días). Como tu fecha es el ${dateText}, llegamos con ${args.bufferDays} días de holgura.`;
    case "HYBRID_TIGHT":
      return `Tenemos ${args.stockReady} unidades en stock y necesitamos reponer ${args.stockMissing}. Llegamos con solo ${args.bufferDays} días de margen a tu fecha del ${dateText} — manejable, pero ajustado. Si tu fecha es flexible, ganas tranquilidad moviéndola unos días.`;
    case "INFEASIBLE": {
      const shortBy = Math.abs(args.bufferDays);
      return `Solo podemos cubrir ${args.stockReady} de las ${args.requiredQuantity} unidades para tu fecha del ${dateText} (nos faltan ${shortBy} días). ¿Quieres reducir cantidad a lo que tenemos en stock, mover tu fecha, o conversar opciones híbridas con un asesor?`;
    }
  }
}

function buildGantt(args: {
  today: Date;
  productionStartDate: Date;
  productionEndDate: Date;
  finalDeliveryDate: Date;
  reorderArrivalDate: Date | null;
  stockReady: number;
  stockMissing: number;
}): GanttSegment[] {
  const segments: GanttSegment[] = [];

  if (args.stockReady > 0 && !args.reorderArrivalDate) {
    segments.push({
      kind: "stock_ready",
      label: `Stock disponible (${args.stockReady} u)`,
      startDate: args.today,
      endDate: args.today,
    });
  }

  if (args.reorderArrivalDate) {
    segments.push({
      kind: "reorder",
      label: `Reposición desde origen (${args.stockMissing} u)`,
      startDate: args.today,
      endDate: args.reorderArrivalDate,
    });
  }

  segments.push({
    kind: "personalization",
    label: "Personalización",
    startDate: args.productionStartDate,
    endDate: args.productionEndDate,
  });

  segments.push({
    kind: "shipping",
    label: "Despacho",
    startDate: args.productionEndDate,
    endDate: args.finalDeliveryDate,
  });

  return segments;
}

// --- Date helpers (sin dependencias externas) -------------------------------

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function formatDateEsCL(d: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
