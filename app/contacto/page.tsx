import type { Metadata } from "next";
import { bolgTokens } from "@/lib/brand/bolg-tokens";

export const metadata: Metadata = {
  title: "Contacto",
};

/**
 * TODO Fase 5+: formulario con React Hook Form + Zod, integrar a Resend
 * para email a ventas. Por ahora muestra canales directos (WhatsApp +
 * email + redes) sin form.
 *
 * TODO Benja: pasarme número WhatsApp y email del equipo corporativo.
 */
export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
        Contacto
      </p>
      <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
        Habla directo con el equipo corporativo de BOLG.
      </h1>
      <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
        Si necesitas algo a medida, una cotización urgente o referencias para
        tu industria, escríbenos. Te respondemos el mismo día hábil.
      </p>

      <dl className="mt-12 grid gap-8 sm:grid-cols-2">
        <ContactItem
          label="Email"
          value="corporativo@bolg.cl"
          href="mailto:corporativo@bolg.cl"
        />
        <ContactItem
          label="Instagram"
          value="@bolg.cl"
          href={bolgTokens.social.instagram}
          external
        />
        <ContactItem
          label="LinkedIn"
          value="BOLG Concept"
          href={bolgTokens.social.linkedin}
          external
        />
        <ContactItem
          label="WhatsApp"
          value="Próximamente"
          href={null}
        />
      </dl>
    </div>
  );
}

function ContactItem({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string;
  href: string | null;
  external?: boolean;
}) {
  return (
    <div className="border-t border-bolg-text pt-4">
      <dt className="text-xs uppercase tracking-[0.2em] text-bolg-text/50">
        {label}
      </dt>
      <dd className="mt-2 font-bolg-body text-lg normal-case tracking-normal text-bolg-text">
        {href ? (
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            className="underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-bolg-text/50">{value}</span>
        )}
      </dd>
    </div>
  );
}
