"use client";

import type { LinePricing } from "./types";

/**
 * Storage del carrito de cotización corporativa.
 *
 * Por ahora persistimos en localStorage (browser only). Cuando lleguemos
 * a la fase de auth con magic link, migramos a Vercel KV con el quote
 * asociado a un email para que el cliente lo pueda retomar desde otro
 * dispositivo.
 *
 * El módulo expone un singleton publisher (suscripción tipo store) para
 * que componentes en distintos puntos del árbol reaccionen a cambios
 * (ej. el badge del header + la página /cotizador).
 */

const STORAGE_KEY = "bolg-quote-v1";

/**
 * Línea simplificada del carrito local. Subset de QuoteLine pensado para
 * persistir lo mínimo necesario para reconstruir la PDP de cada línea
 * y mostrar el resumen del cotizador sin volver a consultar Shopify.
 */
export type CartLine = {
  id: string; // UUID local
  addedAt: string; // ISO
  productId: string;
  productHandle: string;
  productTitle: string;
  productImageUrl: string;
  productCategory: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  techniqueId: string;
  techniqueLabel: string;
  areaId: string;
  areaLabel: string;
  requiredDate: string; // ISO yyyy-mm-dd
  occasion: string | null;
  /** Snapshot del cálculo al momento de agregar. */
  pricing: LinePricing;
  /**
   * Logo del cliente — file original convertido a base64 data URL. Se guarda
   * para enviarlo al equipo BØLG como adjunto del email de cotización.
   * null si el cliente no subió logo (es opcional en la PDP).
   */
  logoDataUrl: string | null;
  /** Nombre original del archivo (ej. "miempresa-logo.svg") para naming del adjunto. */
  logoFileName: string | null;
  /** MIME type del logo (image/svg+xml, image/png, etc.) para naming + content-type. */
  logoMimeType: string | null;
  /**
   * Mockup compuesto — captura PNG del LivePreview con el logo aplicado sobre
   * el producto (posición + escala que el cliente eligió). Se genera vía
   * konva stage.toDataURL al hacer "agregar a cotización".
   * null si no había logo (no tiene sentido capturar el producto sin nada encima).
   */
  mockupDataUrl: string | null;
};

// --- I/O --------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): CartLine[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as CartLine[];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Silencioso. Si el storage está lleno o bloqueado, seguimos.
  }
}

// --- Singleton publisher ----------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();

function publish(): void {
  for (const l of listeners) l();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Cross-tab sync: si otra pestaña modifica el storage, notificamos.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) publish();
  });
}

// --- Public API -------------------------------------------------------------

export function getCart(): CartLine[] {
  return read();
}

export function getCartCount(): number {
  return read().length;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addLine(input: Omit<CartLine, "id" | "addedAt">): CartLine {
  const line: CartLine = {
    ...input,
    id: newId(),
    addedAt: new Date().toISOString(),
  };
  write([...read(), line]);
  publish();
  return line;
}

export function removeLine(id: string): void {
  write(read().filter((l) => l.id !== id));
  publish();
}

export function updateLine(id: string, patch: Partial<CartLine>): void {
  write(read().map((l) => (l.id === id ? { ...l, ...patch } : l)));
  publish();
}

export function clearCart(): void {
  write([]);
  publish();
}
