"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/quote/use-cart";
import { removeLine, clearCart, updateLine, type CartLine } from "@/lib/quote/storage";
import { formatCLP, IVA_RATE } from "@/lib/utils/money";
import { QuoteSubmitDrawer } from "./QuoteSubmitDrawer";

export function QuoteBuilder() {
  const { lines, count, ready } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!ready) {
    return (
      <div className="mt-12 grid gap-4">
        <div className="h-24 animate-pulse rounded-bolg-card bg-bolg-image-bg-light" />
        <div className="h-24 animate-pulse rounded-bolg-card bg-bolg-image-bg-light" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center border border-dashed border-bolg-border py-20 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/50">
          Tu cotización está vacía
        </p>
        <p className="mt-4 max-w-md font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
          Agrega productos desde el catálogo configurando técnica, cantidad y zona de impresión. Cuando estés listo, los enviamos a nuestro equipo comercial.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex items-center gap-2 rounded-bolg-button bg-bolg-button px-6 py-3 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
        >
          Ir al catálogo
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  // Suma consolidada de subtotales netos. Recalculamos IVA del total para
  // mantener consistencia con el formato del PricingPanel de cada línea.
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.subtotalNet, 0);
  const iva = subtotalNet * IVA_RATE;
  const totalGross = subtotalNet + iva;
  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1fr_340px] lg:gap-16">
      <div className="space-y-6">
        {lines.map((line) => (
          <LineRow key={line.id} line={line} />
        ))}

        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Vaciar toda la cotización?")) clearCart();
          }}
          className="mt-4 text-xs uppercase tracking-[0.18em] text-bolg-text/50 underline-offset-4 transition hover:text-bolg-error hover:underline"
        >
          Vaciar cotización
        </button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-bolg-card border border-bolg-border bg-bolg-image-bg-light p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
            Resumen
          </p>
          <div className="mt-4 space-y-2 font-bolg-body text-sm normal-case tracking-normal">
            <Row label={`${count} ${count === 1 ? "línea" : "líneas"}`} value={`${totalUnits} u`} muted />
            <Row label="Subtotal neto" value={formatCLP(subtotalNet)} />
            <Row label="IVA 19%" value={formatCLP(iva)} muted />
            <div className="my-3 border-t border-bolg-border" />
            <Row label="Total bruto" value={formatCLP(totalGross)} emphasis />
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-bolg-button bg-bolg-button px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
          >
            Solicitar cotización formal
          </button>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-bolg-text/40">
            Te enviamos PDF + nos contactamos el mismo día hábil
          </p>
        </div>
      </div>

      <QuoteSubmitDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lines={lines}
      />
    </div>
  );
}

function LineRow({ line }: { line: CartLine }) {
  return (
    <article className="grid gap-4 rounded-bolg-card border border-bolg-border bg-bolg-bg p-4 sm:grid-cols-[120px_1fr_auto] sm:gap-6 sm:p-5">
      <Link
        href={`/catalogo/${line.productHandle}` as never}
        className="relative aspect-square w-full overflow-hidden bg-bolg-image-bg-light sm:w-[120px]"
      >
        {line.productImageUrl && (
          <Image
            src={line.productImageUrl}
            alt={line.productTitle}
            fill
            sizes="120px"
            className="object-contain"
          />
        )}
      </Link>

      <div className="min-w-0 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
          {line.productCategory}
        </p>
        <h3 className="font-bolg-heading text-base uppercase tracking-[0.08em] text-bolg-text">
          {line.productTitle}
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-bolg-body text-xs normal-case tracking-normal text-bolg-text/70 sm:grid-cols-3">
          <Detail label="Técnica" value={line.techniqueLabel} />
          <Detail label="Zona" value={line.areaLabel} />
          <Detail label="Fecha objetivo" value={formatDateShort(line.requiredDate)} />
          {line.occasion && <Detail label="Contexto" value={line.occasion} />}
        </dl>
      </div>

      <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end sm:justify-start sm:gap-3">
        <QuantityInline line={line} />
        <div className="text-right">
          <p className="font-bolg-heading text-lg font-light text-bolg-text">
            {formatCLP(line.pricing.totalGross)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
            Total con IVA
          </p>
        </div>
        <button
          type="button"
          onClick={() => removeLine(line.id)}
          aria-label="Eliminar línea"
          className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/50 underline-offset-4 transition hover:text-bolg-error hover:underline"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

function QuantityInline({ line }: { line: CartLine }) {
  // ±1 por click (igual que el stepper de la PDP). Nota: no re-calculamos
  // pricing del lado del browser para no duplicar el engine. Si el cliente
  // ajusta mucho, vuelve a la PDP. En Fase 5 (server-side) recalculamos.
  const dec = () => {
    updateLine(line.id, { quantity: Math.max(1, line.quantity - 1) });
  };
  const inc = () => {
    updateLine(line.id, { quantity: line.quantity + 1 });
  };
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-bolg-text">
      <button
        type="button"
        onClick={dec}
        aria-label="Restar 1"
        className="flex h-8 w-8 items-center justify-center rounded-bolg-button border border-bolg-border hover:border-bolg-text"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center font-bolg-heading text-base font-light">
        {line.quantity}
      </span>
      <button
        type="button"
        onClick={inc}
        aria-label="Sumar 1"
        className="flex h-8 w-8 items-center justify-center rounded-bolg-button border border-bolg-border hover:border-bolg-text"
      >
        +
      </button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.18em] text-bolg-text/40">
        {label}
      </dt>
      <dd className="text-bolg-text/80">{value}</dd>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-bolg-text/55" : emphasis ? "text-xs uppercase tracking-[0.2em] text-bolg-text" : "text-bolg-text"}>
        {label}
      </dt>
      <dd
        className={
          emphasis
            ? "font-bolg-heading text-xl font-light text-bolg-text"
            : "text-bolg-text"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}
