"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  submitQuoteAction,
  type SubmitResult,
} from "@/lib/quote/submit-action";
import { clearCart, type CartLine } from "@/lib/quote/storage";
import { cn } from "@/lib/utils/cn";

/**
 * Drawer de envío de cotización formal.
 *
 * Stack:
 *  - Drawer derecho con backdrop (mismo patrón que MobileMenu).
 *  - useActionState invoca el Server Action submitQuoteAction.
 *  - El carrito se serializa a JSON y va en un input hidden, así el action
 *    recibe todo en un solo POST (no necesitamos pasar el cart por context).
 *
 * Estados:
 *  - idle: muestra formulario.
 *  - success: muestra confirmación con quoteNumber + CTA al catálogo;
 *    vacía el carrito automáticamente (los datos ya viajaron al PDF/email).
 *  - error: muestra errors inline + formError general.
 */

export function QuoteSubmitDrawer({
  open,
  onClose,
  lines,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<
    SubmitResult | null,
    FormData
  >(submitQuoteAction, null);

  // Lock body scroll mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Vaciar el carrito sólo cuando el usuario CIERRA el drawer del SuccessView.
  // Si lo vaciamos apenas el server contesta ok, el padre (QuoteBuilder)
  // detecta cart vacío y re-renderiza al estado "cotización vacía", botando
  // el drawer antes de que el usuario alcance a leer la confirmación.
  const submitted = state?.ok ?? false;
  const handleClose = () => {
    if (submitted) {
      clearCart();
    }
    onClose();
  };

  // Cerrar con Escape (excepto cuando hay request en vuelo).
  // Inline la lógica de handleClose para que el listener capture el `submitted`
  // actual sin depender de un closure obsoleto.
  useEffect(() => {
    if (!open || pending) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (submitted) clearCart();
      onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, pending, onClose, submitted]);

  const errors = state && !state.ok ? state.errors : {};
  const formError = state && !state.ok ? state.formError : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Enviar cotización"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={pending ? undefined : handleClose}
        aria-label="Cerrar"
        className="absolute inset-0 bg-bolg-text/40 backdrop-blur-sm"
        disabled={pending}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute right-0 top-0 isolate flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-bolg-border px-6 py-5">
          <span className="font-bolg-heading text-xs uppercase tracking-[0.22em] text-bolg-text/60">
            {state?.ok ? "Cotización enviada" : "Enviar cotización"}
          </span>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-bolg-button text-bolg-text hover:bg-bolg-image-bg-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        {state?.ok ? (
          <SuccessView
            quoteNumber={state.quoteNumber}
            dryRun={state.dryRun}
            onClose={handleClose}
          />
        ) : (
          <form
            ref={formRef}
            action={formAction}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Carrito serializado va con la request */}
            <input
              type="hidden"
              name="linesJson"
              value={JSON.stringify(lines)}
            />

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <p className="font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
                Compartenos los datos de tu empresa. Te enviamos el PDF formal por
                email y nuestro equipo se pone en contacto el mismo día hábil.
              </p>

              <Field
                label="Razón social"
                name="companyName"
                placeholder="Ej: Constructora Andina SpA"
                required
                error={errors.companyName}
                autoComplete="organization"
              />

              <Field
                label="RUT empresa"
                name="rut"
                placeholder="76.123.456-7"
                required
                error={errors.rut}
              />

              <Field
                label="Tu nombre"
                name="contactName"
                placeholder="Nombre y apellido"
                required
                error={errors.contactName}
                autoComplete="name"
              />

              <Field
                label="Email de contacto"
                name="contactEmail"
                type="email"
                placeholder="tu@empresa.cl"
                required
                error={errors.contactEmail}
                autoComplete="email"
              />

              <Field
                label="Teléfono (opcional)"
                name="contactPhone"
                type="tel"
                placeholder="+56 9 1234 5678"
                error={errors.contactPhone}
                autoComplete="tel"
              />

              <Field
                label="Contexto (opcional)"
                name="occasion"
                placeholder="Ej: Regalo fin de año, onboarding, evento Q4"
                error={errors.occasion}
              />

              <FieldTextarea
                label="Notas para el equipo (opcional)"
                name="notes"
                placeholder="¿Necesitas algo especial? Tallas específicas, packaging, fecha clave, etc."
                error={errors.notes}
              />

              {formError && (
                <p
                  role="alert"
                  className="rounded border border-bolg-error/30 bg-bolg-error/5 px-4 py-3 text-sm text-bolg-error"
                >
                  {formError}
                </p>
              )}
            </div>

            <footer className="border-t border-bolg-border px-6 py-5">
              <button
                type="submit"
                disabled={pending || lines.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-bolg-button bg-bolg-button px-6 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Enviando…" : "Enviar cotización"}
              </button>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-bolg-text/40">
                Te enviamos copia con el PDF adjunto
              </p>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/60">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={cn(
          "mt-2 block w-full border-b bg-transparent py-2 font-bolg-body text-sm normal-case tracking-normal text-bolg-text placeholder:text-bolg-text/30 focus:outline-none",
          error
            ? "border-bolg-error focus:border-bolg-error"
            : "border-bolg-border focus:border-bolg-text",
        )}
      />
      {error && (
        <span className="mt-1 block text-[11px] text-bolg-error">{error}</span>
      )}
    </label>
  );
}

function FieldTextarea({
  label,
  name,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/60">
        {label}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        aria-invalid={Boolean(error)}
        className={cn(
          "mt-2 block w-full resize-none border bg-transparent p-3 font-bolg-body text-sm normal-case tracking-normal text-bolg-text placeholder:text-bolg-text/30 focus:outline-none",
          error
            ? "border-bolg-error focus:border-bolg-error"
            : "border-bolg-border focus:border-bolg-text",
        )}
      />
      {error && (
        <span className="mt-1 block text-[11px] text-bolg-error">{error}</span>
      )}
    </label>
  );
}

function SuccessView({
  quoteNumber,
  dryRun,
  onClose,
}: {
  quoteNumber: string;
  dryRun: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-bolg-text">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M4 11.5L9 16.5L18 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-bolg-text/60">
        Cotización {quoteNumber}
      </p>

      <h2 className="mt-3 font-bolg-heading text-2xl font-light text-bolg-text">
        Recibimos tu solicitud.
      </h2>

      <p className="mt-4 max-w-sm font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
        Te enviamos el PDF formal por email. Nuestro equipo comercial revisa el
        requerimiento y se pone en contacto el mismo día hábil con stock real,
        lead time confirmado y mockup digital del logo.
      </p>

      {dryRun && (
        <p className="mt-4 rounded border border-bolg-border bg-bolg-image-bg-light px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
          Modo prueba: email no enviado (falta RESEND_API_KEY)
        </p>
      )}

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/catalogo"
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-bolg-button bg-bolg-button px-6 py-3 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
        >
          Seguir explorando el catálogo
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="text-xs uppercase tracking-[0.18em] text-bolg-text/60 underline-offset-4 hover:underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
