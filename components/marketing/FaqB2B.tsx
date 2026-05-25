/**
 * FAQ B2B.
 *
 * TODO Benja: revisar copy de cada respuesta y ajustar a tu realidad
 * operacional (plazos exactos de producción, condiciones de pago,
 * política de devolución, etc.). Las respuestas actuales son defaults
 * razonables basados en el brief y los metafields del mock.
 */
const FAQS = [
  {
    q: "¿Cuál es el mínimo de pedido?",
    a: "El mínimo varía por producto y está indicado en cada ficha del catálogo. En general partimos en 50 unidades para mochilas y vestuario, y 100 unidades para botellas.",
  },
  {
    q: "¿Cuánto se demora la producción?",
    a: "Si el producto está en stock, la personalización toma entre 7 y 15 días hábiles según la técnica. Si necesitas más unidades de las que tenemos en bodega, hacemos reposición desde origen con un lead time aproximado de 60 a 75 días. La ficha de cada producto calcula automáticamente el timeline real para tu cantidad y fecha objetivo.",
  },
  {
    q: "¿Qué técnicas de personalización ofrecen?",
    a: "Serigrafía 1 color y full color, bordado, transfer DTF y grabado láser. Cada producto muestra qué técnicas están disponibles para sus zonas de impresión, junto al costo extra y al tiempo adicional.",
  },
  {
    q: "¿Cómo se factura y qué formas de pago aceptan?",
    a: "Emitimos factura electrónica a nombre de tu empresa (necesitamos razón social, RUT y giro). Operamos típicamente con 50% al confirmar la orden y 50% antes del despacho. Pago vía transferencia electrónica.",
  },
  {
    q: "Los precios que veo, ¿incluyen IVA?",
    a: "El cotizador muestra ambos valores: subtotal neto y total bruto con IVA (19%). En el PDF de la cotización ves cada línea detallada para que tu equipo de finanzas la revise sin ambigüedad.",
  },
  {
    q: "¿Hacen despachos a todo Chile?",
    a: "Sí. Despachamos a todo el país con un partner logístico. El costo del despacho se confirma en la cotización final según volumen y destino.",
  },
  {
    q: "¿Puedo aprobar la cotización sin crear cuenta?",
    a: "Sí. Cuando generes una cotización te enviamos un link público que puedes compartir con tu jefatura o equipo de finanzas. Pueden revisarla y aprobarla solo con email + RUT de la empresa.",
  },
] as const;

export function FaqB2B() {
  return (
    <section className="border-b border-bolg-border bg-bolg-bg">
      <div className="mx-auto max-w-4xl px-6 py-24 lg:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
          Preguntas frecuentes
        </p>
        <h2 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl">
          Las dudas que escuchamos más seguido.
        </h2>

        <dl className="mt-12 divide-y divide-bolg-border border-t border-b border-bolg-border">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-6">
              <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                <dt className="font-bolg-heading text-base uppercase tracking-[0.1em] text-bolg-text sm:text-lg">
                  {faq.q}
                </dt>
                <span
                  aria-hidden
                  className="mt-1 select-none font-bolg-heading text-2xl font-light leading-none text-bolg-text/60 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dd className="mt-4 max-w-3xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:text-base">
                {faq.a}
              </dd>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}
