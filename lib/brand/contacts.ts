/**
 * Datos de contacto público — source of truth para todo el sitio.
 * Si cambia un número o email, se actualiza acá UNA vez.
 */

export const CONTACT = {
  email: "benjamin@bolg.cl",
  /** WhatsApp en formato E.164 (sin "+" porque wa.me lo necesita así). */
  whatsappE164: "56966466977",
  /** Display amigable para mostrar al usuario. */
  whatsappDisplay: "+56 9 6646 6977",
} as const;

export const CONTACT_LINKS = {
  mailto: `mailto:${CONTACT.email}`,
  whatsapp: `https://wa.me/${CONTACT.whatsappE164}`,
  /** Mensaje pre-rellenado para WhatsApp Web/App. */
  whatsappWithMessage: (message: string): string =>
    `https://wa.me/${CONTACT.whatsappE164}?text=${encodeURIComponent(message)}`,
} as const;
