/** IVA chileno. */
export const IVA_RATE = 0.19;

/** Formatea CLP sin decimales: 1234567 → "$1.234.567". */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** Quita IVA: bruto → neto. */
export function netFromGross(gross: number): number {
  return gross / (1 + IVA_RATE);
}

/** Agrega IVA: neto → bruto. */
export function grossFromNet(net: number): number {
  return net * (1 + IVA_RATE);
}
