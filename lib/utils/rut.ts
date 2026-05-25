/**
 * Validador de RUT chileno (algoritmo módulo 11).
 * Acepta formatos "12.345.678-9", "12345678-9", "123456789".
 */

function normalize(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

function computeDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number.parseInt(body[i] ?? "0", 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return "0";
  if (mod === 10) return "K";
  return String(mod);
}

export function isValidRut(rut: string): boolean {
  const clean = normalize(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeDv(body) === dv;
}

export function formatRut(rut: string): string {
  const clean = normalize(rut);
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}
