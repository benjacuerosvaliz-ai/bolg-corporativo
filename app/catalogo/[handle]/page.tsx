import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCorporateProductByHandle } from "@/lib/shopify/storefront";
import { ProductConfigurator } from "@/components/configurator/ProductConfigurator";

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

export default async function PDPPage({ params }: Props) {
  const { handle } = await params;
  const product = await getCorporateProductByHandle(handle);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/catalogo"
        className="text-xs uppercase tracking-[0.2em] text-bolg-text/60 underline-offset-4 hover:text-bolg-text hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/*
          Columna izquierda: preview del producto + (Fase 2d) Konva con logo del cliente.
          Por ahora muestra la imagen principal sticky.
        */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square w-full overflow-hidden bg-bolg-image-bg-light">
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-4 rounded-bolg-card border border-bolg-border bg-bolg-image-bg-light px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/60">
              Preview con tu logo
            </p>
            <p className="mt-2 font-bolg-body text-xs normal-case tracking-normal text-bolg-text/70">
              El preview interactivo en canvas (sube tu logo, drag + resize sobre la zona seleccionada, cálculo en cm reales) llega en Fase 2d.
            </p>
          </div>
        </div>

        {/* Columna derecha: configurador */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl font-light leading-[1.1] sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:text-base">
            {product.description}
          </p>

          <div className="mt-10">
            <ProductConfigurator product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
