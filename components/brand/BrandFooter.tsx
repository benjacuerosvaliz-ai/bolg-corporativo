import Link from "next/link";
import { bolgTokens } from "@/lib/brand/bolg-tokens";
import { CONTACT, CONTACT_LINKS } from "@/lib/brand/contacts";
import { Logo } from "./Logo";

export function BrandFooter() {
  return (
    <footer className="mt-24 border-t border-bolg-border bg-bolg-bg">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 lg:px-10">
        <div className="md:col-span-2">
          <Logo layout="lockup" className="h-20 w-auto" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-bolg-text/70">
            Plataforma corporativa de BØLG. Cotiza productos personalizados con tu logo,
            con stock real, timelines y precios por volumen.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-bolg-text">Plataforma</h3>
          <ul className="mt-4 space-y-2 text-sm text-bolg-text/70">
            <li><Link href="/catalogo" className="transition hover:text-bolg-text">Catálogo</Link></li>
            <li><Link href="/cotizador" className="transition hover:text-bolg-text">Cotizador</Link></li>
            <li><Link href="/mis-cotizaciones" className="transition hover:text-bolg-text">Mis cotizaciones</Link></li>
            <li><Link href="/como-funciona" className="transition hover:text-bolg-text">Cómo funciona</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-bolg-text">Contacto</h3>
          <ul className="mt-4 space-y-2 text-sm text-bolg-text/70">
            <li>
              <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noreferrer noopener" className="transition hover:text-bolg-text">
                WhatsApp · {CONTACT.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={CONTACT_LINKS.mailto} className="transition hover:text-bolg-text">
                {CONTACT.email}
              </a>
            </li>
            <li><Link href="/contacto" className="transition hover:text-bolg-text">Formulario</Link></li>
            <li>
              <a href={bolgTokens.social.instagram} target="_blank" rel="noreferrer noopener" className="transition hover:text-bolg-text">Instagram</a>
            </li>
            <li>
              <a href={bolgTokens.social.linkedin} target="_blank" rel="noreferrer noopener" className="transition hover:text-bolg-text">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bolg-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.18em] text-bolg-text/50 lg:px-10">
          <span>© {new Date().getFullYear()} BØLG</span>
          <span>Hecho en Chile</span>
        </div>
      </div>
    </footer>
  );
}
