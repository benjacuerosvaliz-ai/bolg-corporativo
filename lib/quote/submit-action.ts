"use server";

import { z } from "zod";
import { Resend } from "resend";
import { renderQuotePDFBuffer } from "./pdf";
import { QuoteCreated } from "@/emails/QuoteCreated";
import { QuoteToSales } from "@/emails/QuoteToSales";
import type { CartLine } from "./storage";

/**
 * Server Action de envío de cotización.
 *
 * Flujo:
 *  1. Valida payload con Zod (cliente + carrito).
 *  2. Genera número de cotización Q-YYYYMMDD-XXX.
 *  3. Renderiza PDF con @react-pdf/renderer (server-side, sin DOM).
 *  4. Envía 2 emails vía Resend (cliente + ventas) con el PDF adjunto.
 *  5. Devuelve { ok: true, quoteNumber } o { ok: false, errors }.
 *
 * Modo dry-run: si falta RESEND_API_KEY (dev local sin creds o build),
 * NO falla — solo loggea por consola para que el flujo se pueda probar
 * sin gastar quota ni necesitar dominio verificado.
 */

// --- Schema -----------------------------------------------------------------

// Validación liviana del payload de línea. No re-validamos pricing porque viene
// del engine en el cliente; en Fase 5 server-side recalculamos (anti-tampering).
const CartLineSchema = z.object({
  id: z.string(),
  addedAt: z.string(),
  productId: z.string(),
  productHandle: z.string(),
  productTitle: z.string().min(1),
  productImageUrl: z.string(),
  productCategory: z.string(),
  variantId: z.string(),
  variantTitle: z.string(),
  quantity: z.number().int().positive(),
  techniqueId: z.string(),
  techniqueLabel: z.string(),
  areaId: z.string(),
  areaLabel: z.string(),
  requiredDate: z.string(),
  occasion: z.string().nullable(),
  pricing: z.object({
    unitPriceNet: z.number(),
    customizationUnitPrice: z.number(),
    setupFee: z.number(),
    subtotalNet: z.number(),
    iva: z.number(),
    totalGross: z.number(),
    appliedBreak: z.object({
      minQty: z.number(),
      unitPriceNet: z.number(),
    }),
    nextBreak: z
      .object({
        minQty: z.number(),
        unitPriceNet: z.number(),
        savings: z.number(),
      })
      .nullable(),
    savingsVsBaseline: z.number(),
  }),
});

// RUT chileno: 11.111.111-K (con o sin puntos/guión, dígito verificador 0-9 o K)
const RUT_REGEX = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9Kk]$/;

const SubmitSchema = z.object({
  companyName: z
    .string()
    .min(2, "Ingresa la razón social de la empresa")
    .max(120),
  rut: z
    .string()
    .regex(RUT_REGEX, "Formato RUT inválido (ej: 76.123.456-7)"),
  contactName: z.string().min(2, "Ingresa tu nombre").max(80),
  contactEmail: z.string().email("Email inválido"),
  contactPhone: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  occasion: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  notes: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  lines: z.array(CartLineSchema).min(1, "El carrito está vacío"),
});

export type SubmitInput = z.input<typeof SubmitSchema>;
export type SubmitResult =
  | { ok: true; quoteNumber: string; dryRun: boolean }
  | { ok: false; errors: Record<string, string>; formError?: string };

// --- Quote number -----------------------------------------------------------

function generateQuoteNumber(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  // Sufijo random de 4 chars para evitar colisiones sin storage server-side.
  // En Fase 5 (Vercel KV) reemplazamos por contador incremental atómico.
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `Q-${y}${m}${d}-${suffix}`;
}

// --- Resend setup -----------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "cotizaciones@bolg.cl";
// benjamin@bolg.cl: alias en Cloudflare Email Routing que reenvía a Gmail.
// Cuando exista un correo profesional propio del equipo comercial, lo cambiamos
// vía env var sin tocar código.
const RESEND_INTERNAL_EMAIL =
  process.env.RESEND_INTERNAL_EMAIL || "benjamin@bolg.cl";
const VALIDITY_DAYS = 15;

// --- Action -----------------------------------------------------------------

export async function submitQuoteAction(
  _prevState: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  // 1. Parsear payload.
  let raw: Record<string, unknown>;
  try {
    const linesJson = formData.get("linesJson");
    if (typeof linesJson !== "string") {
      return {
        ok: false,
        errors: {},
        formError: "Carrito no recibido. Recarga la página e intenta de nuevo.",
      };
    }
    raw = {
      companyName: formData.get("companyName"),
      rut: formData.get("rut"),
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone") || undefined,
      occasion: formData.get("occasion") || undefined,
      notes: formData.get("notes") || undefined,
      lines: JSON.parse(linesJson),
    };
  } catch (err) {
    console.error("[submitQuoteAction] parse error", err);
    return {
      ok: false,
      errors: {},
      formError: "No pudimos leer los datos del formulario.",
    };
  }

  // 2. Validar con Zod.
  const parsed = SubmitSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  const createdAt = new Date();
  const quoteNumber = generateQuoteNumber(createdAt);

  // 3. Renderizar PDF.
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderQuotePDFBuffer({
      quoteNumber,
      createdAt,
      validityDays: VALIDITY_DAYS,
      customer: {
        companyName: data.companyName,
        rut: data.rut,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone ?? undefined,
      },
      lines: data.lines as CartLine[],
    });
  } catch (err) {
    console.error("[submitQuoteAction] PDF render error", err);
    return {
      ok: false,
      errors: {},
      formError:
        "No pudimos generar el PDF de la cotización. Inténtalo de nuevo o escríbenos a cotizaciones@bolg.cl.",
    };
  }

  // 4. Enviar emails (o dry-run si no hay credenciales).
  const pdfFilename = `Cotizacion-${quoteNumber}-BOLG.pdf`;

  if (!RESEND_API_KEY) {
    // Dry-run: log y devuelve éxito para que el dev pueda iterar sin Resend.
    console.warn(
      "[submitQuoteAction] DRY-RUN — sin RESEND_API_KEY. " +
        `Cotización ${quoteNumber} de ${data.companyName} (${data.contactEmail}) ` +
        `· ${data.lines.length} líneas · PDF ${pdfBuffer.byteLength} bytes`,
    );
    return { ok: true, quoteNumber, dryRun: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // Email al cliente con PDF adjunto.
    const clientEmail = await resend.emails.send({
      from: `BØLG Corporativo <${RESEND_FROM_EMAIL}>`,
      to: data.contactEmail,
      replyTo: RESEND_INTERNAL_EMAIL,
      subject: `Cotización ${quoteNumber} · BØLG Corporativo`,
      react: QuoteCreated({
        quoteNumber,
        createdAt,
        validityDays: VALIDITY_DAYS,
        customer: {
          companyName: data.companyName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
        },
        lines: data.lines as CartLine[],
      }),
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
        },
      ],
    });

    if (clientEmail.error) {
      console.error("[submitQuoteAction] client email error", clientEmail.error);
    }

    // Email interno a ventas (con el mismo PDF adjunto y reply-to al cliente
    // para que un "Responder" vaya directo a él).
    const salesEmail = await resend.emails.send({
      from: `BØLG Corporativo <${RESEND_FROM_EMAIL}>`,
      to: RESEND_INTERNAL_EMAIL,
      replyTo: data.contactEmail,
      subject: `[Lead] ${quoteNumber} · ${data.companyName}`,
      react: QuoteToSales({
        quoteNumber,
        createdAt,
        customer: {
          companyName: data.companyName,
          rut: data.rut,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        },
        occasion: data.occasion,
        notes: data.notes,
        lines: data.lines as CartLine[],
      }),
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
        },
      ],
    });

    if (salesEmail.error) {
      console.error("[submitQuoteAction] sales email error", salesEmail.error);
      // No fallamos al cliente si el email interno falla; el cliente sí recibió
      // su copia. Lo loggeamos para corregir DNS/template.
    }
  } catch (err) {
    console.error("[submitQuoteAction] resend error", err);
    return {
      ok: false,
      errors: {},
      formError:
        "Tu cotización se generó pero el envío del email falló. Escríbenos a cotizaciones@bolg.cl mencionando este código: " +
        quoteNumber,
    };
  }

  return { ok: true, quoteNumber, dryRun: false };
}
