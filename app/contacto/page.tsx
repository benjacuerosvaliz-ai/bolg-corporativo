import type { Metadata } from "next";
import { bolgTokens } from "@/lib/brand/bolg-tokens";
import { CONTACT, CONTACT_LINKS } from "@/lib/brand/contacts";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Habla directo con el equipo corporativo de BØLG. WhatsApp, email o formulario. Respondemos el mismo día hábil.",
};

/**
 * /contacto — página con dos vías de entrada:
 *  1. Canales directos (WhatsApp + email) destacados arriba para urgencias.
 *  2. Formulario abajo, conectado al Server Action submitContactAction
 *     que envía a benjamin@bolg.cl vía Resend.
 *
 * El form es client component (useActionState) pero la página se mantiene
 * server para que el HTML inicial cargue rápido y bien indexable.
 */
export default function ContactoPage() {
  return (
    <>
      {/* Header + canales directos */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
          <p className="text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:text-xs">
            Contacto
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-light leading-[1.05] sm:mt-6 sm:text-4xl lg:text-5xl">
            Habla directo con el equipo corporativo de BØLG.
          </h1>
          <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:mt-8 sm:text-lg">
            Si necesitas algo a medida, una cotización urgente o referencias
            para tu industria, escríbenos. Respondemos el mismo día hábil.
          </p>

          {/* CTAs directos: WhatsApp + Email. Para usuarios que ya tienen
              pregunta clara y no quieren llenar el formulario. */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={CONTACT_LINKS.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-3 rounded-bolg-button bg-bolg-button px-7 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp · {CONTACT.whatsappDisplay}
            </a>
            <a
              href={CONTACT_LINKS.mailto}
              className="inline-flex items-center justify-center gap-3 rounded-bolg-button border border-bolg-text px-7 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:bg-bolg-text hover:text-bolg-button-text"
            >
              {CONTACT.email}
            </a>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
                O escríbenos
              </p>
              <h2 className="mt-4 font-bolg-heading text-2xl font-light leading-[1.1] text-bolg-text sm:text-3xl">
                Cuéntanos qué necesitas.
              </h2>
              <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
                Si prefieres dejar el detalle por escrito, este formulario
                llega directo a Benjamín en BØLG. Sin filtros, sin call center.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Redes sociales como complemento */}
      <section className="bg-bolg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            También en
          </p>
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <SocialItem
              label="Instagram"
              value="@bolg.cl"
              href={bolgTokens.social.instagram}
            />
            <SocialItem
              label="LinkedIn"
              value="BØLG Concept"
              href={bolgTokens.social.linkedin}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function SocialItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="border-t border-bolg-border pt-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
        {label}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-block font-bolg-body text-lg normal-case tracking-normal text-bolg-text underline-offset-4 hover:underline"
      >
        {value}
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.51-5.26c0-5.445 4.455-9.885 9.94-9.885a9.87 9.87 0 0 1 7.022 2.91 9.88 9.88 0 0 1 2.913 7.02c-.004 5.444-4.455 9.885-9.945 9.885" />
    </svg>
  );
}
