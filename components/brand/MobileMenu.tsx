"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/casos-de-exito", label: "Casos de éxito" },
  { href: "/contacto", label: "Contacto" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar al cambiar de página.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando el menú está abierto.
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-bolg-button text-bolg-text transition hover:bg-bolg-image-bg-light md:hidden"
      >
        {/* Ícono hamburguesa minimal */}
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
          <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Backdrop + drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="absolute inset-0 bg-bolg-text/40 backdrop-blur-sm"
        />

        {/* Drawer desde la derecha. isolate crea stacking context propio
            para que no se mezcle con backdrop-filter de capas inferiores. */}
        <div
          className={cn(
            "absolute right-0 top-0 isolate flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <header className="flex items-center justify-between border-b border-bolg-border px-6 py-5">
            <span className="font-bolg-heading text-xs uppercase tracking-[0.25em] text-bolg-text/60">
              Menú
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-bolg-button text-bolg-text hover:bg-bolg-image-bg-light"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </header>

          <nav className="flex flex-1 flex-col gap-1 px-6 py-8">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === pathname ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href as never}
                  className={cn(
                    "block py-3 font-bolg-heading text-base uppercase tracking-[0.18em] transition",
                    isActive
                      ? "text-bolg-text"
                      : "text-bolg-text/60 hover:text-bolg-text",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTAs grandes al final del drawer */}
          <div className="space-y-3 border-t border-bolg-border px-6 py-6">
            <Link
              href="/catalogo"
              className="flex w-full items-center justify-center rounded-bolg-button bg-bolg-button px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="flex w-full items-center justify-center rounded-bolg-button border border-bolg-text px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
