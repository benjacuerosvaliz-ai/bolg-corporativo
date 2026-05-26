"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  submitContactAction,
  type ContactSubmitResult,
} from "@/lib/contact/submit-action";
import { cn } from "@/lib/utils/cn";

/**
 * Formulario público de contacto general.
 *
 * Patrón useActionState igual que el del cotizador: el server action devuelve
 * { ok, errors?, formError? } y el form reacciona inline. Cuando llega OK,
 * limpiamos el textarea (los demás campos los dejamos por si quieren reenviar
 * variando algo) y mostramos un acuse de recibo en vez de re-renderizar todo
 * — así el usuario tiene la confianza de que el mail salió.
 */
export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    ContactSubmitResult | null,
    FormData
  >(submitContactAction, null);

  // Al recibir OK, limpiamos el form.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};
  const formError = state && !state.ok ? state.formError : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-5 sm:grid-cols-2 sm:gap-x-8"
    >
      <Field
        label="Tu nombre"
        name="name"
        required
        autoComplete="name"
        error={errors.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={errors.email}
      />
      <Field
        label="Empresa (opcional)"
        name="company"
        autoComplete="organization"
        error={errors.company}
      />
      <Field
        label="Teléfono (opcional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        error={errors.phone}
      />

      <div className="sm:col-span-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/60">
            En qué te podemos ayudar
          </span>
          <textarea
            name="message"
            rows={5}
            required
            placeholder="Cuéntanos qué estás buscando: tipo de regalo, cantidad aproximada, fecha objetivo, contexto. Mientras más detalle, mejor la primera propuesta."
            aria-invalid={Boolean(errors.message)}
            className={cn(
              "mt-2 block w-full resize-none border bg-transparent p-3 font-bolg-body text-sm normal-case tracking-normal text-bolg-text placeholder:text-bolg-text/30 focus:outline-none",
              errors.message
                ? "border-bolg-error focus:border-bolg-error"
                : "border-bolg-border focus:border-bolg-text",
            )}
          />
          {errors.message && (
            <span className="mt-1 block text-[11px] text-bolg-error">
              {errors.message}
            </span>
          )}
        </label>
      </div>

      {formError && (
        <div
          role="alert"
          className="sm:col-span-2 rounded border border-bolg-error/30 bg-bolg-error/5 px-4 py-3 text-sm text-bolg-error"
        >
          {formError}
        </div>
      )}

      {state?.ok && (
        <div
          role="status"
          className="sm:col-span-2 border border-bolg-text bg-bolg-image-bg-light px-5 py-4"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-bolg-text">
            Mensaje enviado
          </p>
          <p className="mt-2 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/80">
            Recibimos tu mensaje. Te respondemos el mismo día hábil al email
            que dejaste.
            {state.dryRun && (
              <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-bolg-text/50">
                · Modo prueba: email no enviado (falta RESEND_API_KEY)
              </span>
            )}
          </p>
        </div>
      )}

      <div className="sm:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[11px] font-bolg-body normal-case tracking-normal text-bolg-text/50">
          Respondemos el mismo día hábil. Sin spam, sin secuencias automáticas.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-bolg-button bg-bolg-button px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
        >
          {pending ? "Enviando…" : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/60">
        {label}
      </span>
      <input
        type={type}
        name={name}
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
