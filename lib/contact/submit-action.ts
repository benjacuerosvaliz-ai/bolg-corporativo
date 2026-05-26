"use server";

import { z } from "zod";
import { Resend } from "resend";
import { ContactInquiry } from "@/emails/ContactInquiry";

/**
 * Server Action del formulario de contacto general.
 *
 * Diferente del flujo de cotización: acá no hay PDF ni carrito — sólo un
 * mensaje libre del usuario al equipo BØLG. Reply-to apunta al cliente,
 * así un "Responder" desde Gmail va directo a él.
 *
 * Misma estrategia dry-run que submitQuoteAction: sin RESEND_API_KEY,
 * loggea y devuelve éxito en vez de fallar.
 */

const SubmitSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre").max(80),
  email: z.string().email("Email inválido"),
  company: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  phone: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  message: z
    .string()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(3000, "Máximo 3.000 caracteres"),
});

export type ContactSubmitResult =
  | { ok: true; dryRun: boolean }
  | { ok: false; errors: Record<string, string>; formError?: string };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "benjamin@bolg.cl";
const RESEND_INTERNAL_EMAIL =
  process.env.RESEND_INTERNAL_EMAIL || "benjamin@bolg.cl";

export async function submitContactAction(
  _prevState: ContactSubmitResult | null,
  formData: FormData,
): Promise<ContactSubmitResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
  };

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
  const submittedAt = new Date();

  if (!RESEND_API_KEY) {
    console.warn(
      `[submitContactAction] DRY-RUN — sin RESEND_API_KEY. ` +
        `Mensaje de ${data.name} <${data.email}>: "${data.message.slice(0, 80)}..."`,
    );
    return { ok: true, dryRun: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const result = await resend.emails.send({
      from: `BØLG Contacto <${RESEND_FROM_EMAIL}>`,
      to: RESEND_INTERNAL_EMAIL,
      replyTo: data.email,
      subject: `[Contacto] ${data.name}${data.company ? ` · ${data.company}` : ""}`,
      react: ContactInquiry({
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        message: data.message,
        submittedAt,
      }),
    });

    if (result.error) {
      console.error("[submitContactAction] resend error", result.error);
      return {
        ok: false,
        errors: {},
        formError:
          "No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos directo a benjamin@bolg.cl.",
      };
    }
  } catch (err) {
    console.error("[submitContactAction] exception", err);
    return {
      ok: false,
      errors: {},
      formError:
        "Hubo un error al enviar. Por favor escríbenos directo a benjamin@bolg.cl.",
    };
  }

  return { ok: true, dryRun: false };
}
