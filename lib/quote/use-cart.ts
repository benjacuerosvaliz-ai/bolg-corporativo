"use client";

import { useEffect, useState } from "react";
import { getCart, subscribe, type CartLine } from "./storage";

/**
 * Hook para usar el carrito desde Client Components.
 * Suscribe al publisher para re-render cuando cambia el storage.
 *
 * Maneja el problema de SSR: hasta el primer render en cliente, devuelve
 * un array vacío (matches SSR output). useEffect después hidrata con la
 * data real de localStorage.
 */
export function useCart(): {
  lines: CartLine[];
  count: number;
  ready: boolean;
} {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(getCart());
    setReady(true);
    return subscribe(() => setLines(getCart()));
  }, []);

  return { lines, count: lines.length, ready };
}
