import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HandshakeIcon,
  PencilIcon,
  ChartIcon,
  DiamondIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Casos de éxito",
  description:
    "Empresas como Bayer, Astara, Monsanto, Viña Ventisquero y Check Fast Cherry confían en BØLG para sus regalos corporativos y kits de bienvenida.",
};

/**
 * /casos-de-exito — página de credibilidad B2B.
 *
 * Estrategia: en vez de armar 3 "case studies" inventados, mostramos la
 * realidad — listado de clientes (con permiso de uso confirmado por Benja
 * 2026-05-26) + valor que entregamos en cada caso, sin afirmar cantidades
 * ni contextos específicos que no podemos verificar. Cuando Benja pase
 * detalles formales (con cita interna autorizada), agregamos sección
 * "Casos en detalle" abajo.
 */

type Client = {
  name: string;
  /** Slug del logo en /public/clients/{slug}.png. Si null, fallback tipográfico. */
  logoSlug: string | null;
};

const CLIENTS: readonly Client[] = [
  { name: "Bayer", logoSlug: "bayer" },
  { name: "Astara", logoSlug: "astara" },
  { name: "Monsanto", logoSlug: "monsanto" },
  { name: "Viña Ventisquero", logoSlug: "ventisquero" },
  { name: "Check Fast Cherry", logoSlug: "check-fast-cherry" },
  { name: "MyPYMES Chilenas", logoSlug: "mypymes" },
];

type ValueProp = {
  title: string;
  body: string;
  icon: ReactNode;
};

const VALUE_PROPS: readonly ValueProp[] = [
  {
    title: "Productos que se usan",
    body: "Mochilas y botellas BØLG son artículos que el equipo lleva al día siguiente del onboarding. No quedan en un cajón. Eso eleva el ROI del regalo corporativo respecto a un mug genérico o un cuaderno.",
    icon: <HandshakeIcon className="h-6 w-6" />,
  },
  {
    title: "Personalización con criterio",
    body: "Trabajamos la aplicación del logo cuidando proporción, zona y técnica para que se vea bien — no aplastamos el logo del cliente sobre un producto cualquiera. Mockup digital de aprobación antes de producir.",
    icon: <PencilIcon className="h-6 w-6" />,
  },
  {
    title: "Stock real, no promesas",
    body: "La ficha de cada producto muestra inventario en tiempo real desde nuestra bodega. Si necesitas 200 unidades para un evento en 3 semanas, el sitio te dice si es viable antes de cotizar.",
    icon: <ChartIcon className="h-6 w-6" />,
  },
  {
    title: "Operación premium, precio razonable",
    body: "Factura electrónica, pago 50/50, despacho a todo Chile, lead time confirmado por escrito. La calidad BØLG con la formalidad que finanzas corporativas necesita.",
    icon: <DiamondIcon className="h-6 w-6" />,
  },
];

export default function CasosDeExitoPage() {
  return (
    <>
      {/*
        Sección única: header + lista de cuentas. Antes había dos sections
        consecutivas (hero blanco + grilla gris) diciendo lo mismo dos veces.
        Consolidado para ir directo a la prueba social que vale: los logos.
      */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <p className="text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:text-xs">
            Casos de éxito · Selección de cuentas
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-light leading-[1.05] sm:mt-6 sm:text-4xl lg:text-5xl">
            Marcas que ya confiaron en BØLG sus regalos corporativos.
          </h1>
          <p className="mt-6 max-w-2xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/75 sm:mt-8 sm:text-lg">
            Desde multinacionales con miles de colaboradores hasta PyMEs que
            quieren regalar bien sin perder el toque.
          </p>

          {/*
            Grilla "logo wall" estilo galería: sólo los logos, sin captions.
            Sin fondo ni bordes — los logos flotan directo sobre el fondo de
            la página. Más editorial, menos "tabla". Gap generoso para que
            cada logo respire en su propio espacio.
          */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:mt-16 lg:gap-14">
            {CLIENTS.map((c) => (
              <article
                key={c.name}
                className="relative flex h-32 items-center justify-center p-4 sm:h-36 lg:h-40"
              >
                {c.logoSlug ? (
                  <Image
                    src={`/clients/${c.logoSlug}.png`}
                    alt={`Logo ${c.name}`}
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain"
                  />
                ) : (
                  <p className="font-bolg-heading text-xl uppercase tracking-[0.1em] text-bolg-text sm:text-2xl">
                    {c.name}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué eligen BØLG */}
      <section className="border-b border-bolg-border bg-bolg-bg">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            Por qué eligen BØLG
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-light leading-[1.1] sm:text-3xl lg:text-4xl">
            Calidad de marca, operación premium.
          </h2>

          <dl className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:gap-y-16">
            {VALUE_PROPS.map((v, i) => (
              <div key={v.title} className="border-t border-bolg-border pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon en círculo: ancla visual + número de orden al lado */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bolg-text/30 text-bolg-text">
                    {v.icon}
                  </div>
                  <p className="font-bolg-heading text-3xl font-light leading-none text-bolg-text/30 sm:text-4xl">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>
                <dt className="mt-5 font-bolg-heading text-lg uppercase tracking-[0.08em] text-bolg-text sm:text-xl">
                  {v.title}
                </dt>
                <dd className="mt-3 max-w-prose font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:text-base">
                  {v.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-bolg-announcement text-bolg-button-text">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] opacity-70">
              ¿Tu empresa es la próxima?
            </p>
            <h2 className="mt-3 text-2xl font-light leading-[1.1] sm:text-3xl lg:text-4xl">
              Cotizar es directo: catálogo, configuras, envías.
            </h2>
          </div>
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
