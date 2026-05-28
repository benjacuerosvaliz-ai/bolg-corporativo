"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/quote/use-cart";
import { removeLine } from "@/lib/quote/storage";
import { formatCLP, IVA_RATE } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

/**
 * Badge del carrito + mini-cart drawer (patrón ecommerce clásico).
 *
 * Al click en el ícono se abre un drawer lateral con el resumen del carrito
 * (thumbnail, título, cantidad, total por línea) + total general + CTA
 * "Ir a la cotización" que lleva a /cotizador (la página completa donde se
 * edita cantidad y se envía).
 *
 * El drawer va en un portal a document.body para no quedar recortado por el
 * backdrop-filter del header sticky (mismo motivo que MobileMenu).
 */
export function QuoteMiniCart() {
  const { lines, count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar al navegar (ej. tras "Ir a la cotización").
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + Escape mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  const showCount = ready && count > 0;

  const subtotalNet = lines.reduce((s, l) => s + l.pricing.subtotalNet, 0);
  const totalGross = subtotalNet * (1 + IVA_RATE);

  const drawer = (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Resumen de tu cotización"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cerrar"
        className="absolute inset-0 bg-bolg-text/40 backdrop-blur-sm"
      />

      <div
        className={cn(
          "absolute right-0 top-0 isolate flex h-full w-full max-w-md flex-col bg-bolg-bg shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-bolg-border px-6 py-5">
          <span className="font-bolg-heading text-xs uppercase tracking-[0.22em] text-bolg-text/60">
            Tu cotización {count > 0 && `· ${count}`}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-bolg-button text-bolg-text hover:bg-bolg-image-bg-light"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-bolg-text/50">
              Tu cotización está vacía
            </p>
            <Link
              href="/catalogo"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-bolg-button bg-bolg-button px-6 py-3 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
            >
              Ir al catálogo <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de líneas (resumen, sin edición de cantidad) */}
            <div className="flex-1 divide-y divide-bolg-border overflow-y-auto px-6">
              {lines.map((line) => (
                <div key={line.id} className="flex gap-4 py-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-bolg-image-bg-light">
                    {line.productImageUrl && (
                      <Image
                        src={line.productImageUrl}
                        alt={line.productTitle}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bolg-heading text-sm uppercase tracking-[0.06em] text-bolg-text">
                      {line.productTitle}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-bolg-text/50">
                      {line.quantity} u · {line.techniqueLabel}
                    </p>
                    <p className="mt-1 font-bolg-body text-sm tracking-normal text-bolg-text">
                      {formatCLP(line.pricing.totalGross)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    aria-label={`Eliminar ${line.productTitle}`}
                    className="self-start text-[10px] uppercase tracking-[0.16em] text-bolg-text/40 underline-offset-4 transition hover:text-bolg-error hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            {/* Footer: total + CTA */}
            <footer className="border-t border-bolg-border px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
                  Total bruto
                </span>
                <span className="font-bolg-heading text-xl font-light text-bolg-text">
                  {formatCLP(totalGross)}
                </span>
              </div>
              <Link
                href="/cotizador"
                onClick={() => setOpen(false)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-bolg-button bg-bolg-button px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
              >
                Ir a la cotización
                <span aria-hidden>→</span>
              </Link>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-bolg-text/40">
                Ajusta cantidades y envía desde ahí
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
