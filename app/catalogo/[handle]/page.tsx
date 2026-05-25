import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCorporateProductByHandle } from "@/lib/shopify/storefront";
import { formatCLP } from "@/lib/utils/money";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getCorporateProductByHandle(handle);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.title,
    description: product.description,
  };
}

/**
 * Stub de PDP corporativa. La PDP completa (configurador con Konva,
 * pricing engine, stock analysis, gantt) se construye en Fase 2.
 *
 * Esta versión muestra info básica para validar el routing y los
 * mocks. No tiene configurador todavía.
 */
export default async function PDPStubPage({ params }: Props) {
  const { handle } = await params;
  const product = await getCorporateProductByHandle(handle);
  if (!product) notFound();

  const firstBreak = product.volumePricing[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <Link
        href="/catalogo"
        className="text-xs uppercase tracking-[0.2em] text-bolg-text/60 underline-offset-4 hover:text-bolg-text hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square w-full overflow-hidden bg-bolg-image-bg-light">
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            {product.category}
          </p>
          <h1 className="mt-4 text-3xl font-light leading-[1.1] sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-6 font-bolg-body text-base normal-case tracking-normal text-bolg-text/75">
            {product.description}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-bolg-border pt-8">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
                Desde
              </dt>
              <dd className="mt-1 font-bolg-heading text-xl font-light">
                {firstBreak ? formatCLP(firstBreak.unitPriceNet) : "—"}
                <span className="ml-1 text-xs text-bolg-text/60">/ unidad</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
                Mínimo
              </dt>
              <dd className="mt-1 font-bolg-heading text-xl font-light">
                {product.minQty} u
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
                Lead time reposición
              </dt>
              <dd className="mt-1 font-bolg-heading text-xl font-light">
                {product.leadTimeDaysReorder} d
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
                Técnicas
              </dt>
              <dd className="mt-1 font-bolg-body text-sm normal-case tracking-normal text-bolg-text">
                {product.printTechniques.length}
              </dd>
            </div>
          </dl>

          <div className="mt-10 rounded-bolg-card border border-bolg-border bg-bolg-image-bg-light p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
              Configurador
            </p>
            <p className="mt-3 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75">
              El configurador completo con preview de logo, selector de zona,
              técnica de impresión, análisis de stock y precio en vivo llega en
              Fase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
