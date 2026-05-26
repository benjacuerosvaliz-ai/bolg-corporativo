import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Del catálogo a la entrega en 4 pasos: configurar, cotizar, aprobar mockup y producir. Lead times, condiciones comerciales y formas de pago del proceso B2B de BØLG Corporativo.",
};

/**
 * /como-funciona — documenta el flujo real del producto en 4 pasos.
 *
 * No inventa nada: cada paso refleja lo que el cliente realmente hace en el
 * sitio (configurar en PDP → enviar carrito → aprobar mockup vía email →
 * producción + despacho). Condiciones comerciales tomadas de FaqB2B + PDF
 * de cotización para mantener un solo source of truth.
 */
export default function ComoFuncionaPage() {
  return (
    <>
      {/* Header editorial */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-28">
          <p className="text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:text-xs">
            Cómo funciona
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-light leading-[1.05] sm:mt-6 sm:text-5xl lg:text-6xl">
            Del catálogo a la entrega en 4 pasos.
          </h1>
          <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:mt-8 sm:text-lg">
            Pensado para que tu equipo de marketing o RRHH pueda dejar
            avanzada una cotización en minutos, con stock real y precios
            transparentes, sin tener que escribir 5 correos para entender
            tiempos y condiciones.
          </p>
        </div>
      </section>

      {/* 4 pasos */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Step
            number="01"
            title="Configurar"
            body="Explora los 49 productos del catálogo. En cada ficha eliges técnica de impresión (serigrafía, bordado, DTF, grabado láser), cantidad y zona de aplicación del logo. Subes tu archivo y ves un preview real con tu logo aplicado antes de cotizar. El precio por volumen baja a medida que subes la cantidad."
            highlights={[
              "Mínimo 10 unidades por producto",
              "Stock real desde nuestra bodega en tiempo real",
              "Preview con tu logo antes de cotizar",
            ]}
          />
          <Step
            number="02"
            title="Cotizar"
            body="Agregas líneas a tu cotización (puedes mezclar productos: por ejemplo 50 mochilas + 100 botellas). Cuando estés listo, completas los datos de tu empresa y enviamos un PDF formal con el detalle a tu correo, listo para que tu equipo de finanzas lo revise."
            highlights={[
              "PDF formal por email al instante",
              "Multi-producto en una sola cotización",
              "Validez 15 días desde la emisión",
            ]}
          />
          <Step
            number="03"
            title="Aprobar mockup"
            body="Nuestro equipo te responde el mismo día hábil. Confirmamos stock real por talla y color, lead time exacto según tu fecha objetivo, y te enviamos un mockup digital de cómo se ve el logo aplicado sobre el producto final. Apruebas antes de producir — sin sorpresas."
            highlights={[
              "Respuesta el mismo día hábil",
              "Mockup digital de aprobación",
              "Sin costo hasta que confirmas",
            ]}
          />
          <Step
            number="04"
            title="Producir y despachar"
            body="Apruebas, emitimos factura electrónica a nombre de tu empresa y entramos a producción. La forma de pago habitual es 50% al confirmar la orden y 50% antes del despacho. Despachamos a todo Chile vía partner logístico, con tracking compartido."
            highlights={[
              "Factura electrónica con razón social + RUT",
              "50% al confirmar · 50% antes del despacho",
              "Despacho a todo Chile",
            ]}
            last
          />
        </div>
      </section>

      {/* Lead time según stock */}
      <section className="border-b border-bolg-border bg-bolg-image-bg-light">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            Lead time
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-light leading-[1.1] sm:text-3xl lg:text-4xl">
            Dos escenarios según disponibilidad.
          </h2>
          <p className="mt-4 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70 sm:text-base">
            La ficha de cada producto calcula automáticamente el timeline real
            para tu cantidad y fecha objetivo. Aquí está el resumen.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <article className="border border-bolg-border bg-bolg-bg p-8 lg:p-10">
              <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/50">
                Escenario A
              </p>
              <h3 className="mt-3 font-bolg-heading text-xl uppercase tracking-[0.08em] text-bolg-text sm:text-2xl">
                Con stock inmediato
              </h3>
              <p className="mt-2 font-bolg-heading text-4xl font-light text-bolg-text sm:text-5xl">
                7 — 15 días hábiles
              </p>
              <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70 sm:text-base">
                Cuando el producto está disponible en nuestra bodega, sólo
                pasa por personalización. El tiempo exacto depende de la
                técnica de impresión (DTF y láser son los más rápidos,
                bordado y serigrafía full color toman un poco más).
              </p>
            </article>

            <article className="border border-bolg-border bg-bolg-bg p-8 lg:p-10">
              <p className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/50">
                Escenario B
              </p>
              <h3 className="mt-3 font-bolg-heading text-xl uppercase tracking-[0.08em] text-bolg-text sm:text-2xl">
                Producción desde origen
              </h3>
              <p className="mt-2 font-bolg-heading text-4xl font-light text-bolg-text sm:text-5xl">
                ~150 días desde OC
              </p>
              <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70 sm:text-base">
                Si necesitas más unidades de las que tenemos en bodega,
                hacemos reposición desde origen. Ideal para volúmenes
                grandes (300+ unidades) con tiempo de planificación —
                por ejemplo regalos de fin de año cotizados en julio.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Condiciones comerciales — grid 4 cards */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            Condiciones comerciales
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-light leading-[1.1] sm:text-3xl lg:text-4xl">
            Las reglas del juego, sin letra chica.
          </h2>

          <dl className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            <TermCard
              label="Cantidad mínima"
              value="10 unidades"
              detail="Por producto. Puedes combinar varios productos distintos en una sola cotización."
            />
            <TermCard
              label="Formas de pago"
              value="50 / 50"
              detail="50% al confirmar la orden, 50% antes del despacho. Vía transferencia electrónica."
            />
            <TermCard
              label="Facturación"
              value="Electrónica"
              detail="A nombre de tu empresa. Necesitamos razón social, RUT y giro."
            />
            <TermCard
              label="Validez cotización"
              value="15 días"
              detail="Desde la emisión del PDF. Después de eso revisamos precios según disponibilidad."
            />
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-bolg-announcement text-bolg-button-text">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-24">
          <h2 className="max-w-2xl text-2xl font-light leading-[1.1] sm:text-3xl lg:text-4xl">
            Listo para configurar tu primera cotización.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-bolg-button bg-bolg-bg px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-text transition hover:opacity-90"
            >
              Ver catálogo
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-bolg-button border border-bolg-button-text px-8 py-4 text-xs uppercase tracking-[0.2em] text-bolg-button-text transition hover:bg-bolg-button-text hover:text-bolg-announcement"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  number,
  title,
  body,
  highlights,
  last,
}: {
  number: string;
  title: string;
  body: string;
  highlights: readonly string[];
  last?: boolean;
}) {
  return (
    <article
      className={
        last
          ? "grid gap-6 py-12 first:pt-0 lg:grid-cols-[140px_1fr] lg:gap-16 lg:py-20"
          : "grid gap-6 border-b border-bolg-border py-12 first:pt-0 lg:grid-cols-[140px_1fr] lg:gap-16 lg:py-20"
      }
    >
      <div>
        <p className="font-bolg-heading text-5xl font-light leading-none text-bolg-text/30 sm:text-6xl lg:text-7xl">
          {number}
        </p>
      </div>

      <div className="max-w-3xl">
        <h3 className="font-bolg-heading text-2xl uppercase tracking-[0.06em] text-bolg-text sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:mt-5 sm:text-lg">
          {body}
        </p>
        <ul className="mt-6 space-y-2 sm:mt-8">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-3 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/85"
            >
              <span aria-hidden className="mt-[6px] inline-block h-1 w-3 flex-shrink-0 bg-bolg-text/50" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function TermCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-t border-bolg-border pt-5">
      <dt className="text-[10px] uppercase tracking-[0.22em] text-bolg-text/55">
        {label}
      </dt>
      <dd className="mt-3 font-bolg-heading text-3xl font-light leading-none text-bolg-text sm:text-4xl">
        {value}
      </dd>
      <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
        {detail}
      </p>
    </div>
  );
}
