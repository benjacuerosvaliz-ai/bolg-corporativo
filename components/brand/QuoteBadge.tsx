"use client";

import Link from "next/link";
import { useCart } from "@/lib/quote/use-cart";

/**
 * Badge del carrito en el header. Muestra ícono + counter de líneas.
 * Reactivo: se actualiza al instante cuando agregas o quitas líneas
 * desde cualquier parte de la app (cross-tab incluído).
 */
export function QuoteBadge() {
  const { count, ready } = useCart();

  // Mientras hidrata, mostramos el ícono sin badge para evitar mismatch SSR.
  const showCount = ready && count > 0;

  return (
    <Link
      href="/cotizador"
      aria-label={`Tu cotización · ${count} producto${count === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-bolg-button text-bolg-text transition hover:bg-bolg-image-bg-light"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M2 4h2l2 9h9l2-7H5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="1" fill="currentColor" />
        <circle cx="14" cy="16" r="1" fill="currentColor" />
      </svg>
      {showCount && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bolg-text px-1 text-[10px] font-medium text-bolg-button-text">
          {count}
        </span>
      )}
    </Link>
  );
}
