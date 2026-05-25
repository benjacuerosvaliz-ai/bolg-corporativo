import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCorporateProductByHandle } from "@/lib/shopify/storefront";
import { getInventoryLevel } from "@/lib/shopify/admin";
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

  // Pre-fetch stock para todas las variantes. Mock por ahora.
  const inventoryEntries = await Promise.all(
    product.variants.map(async (v) => {
      const level = await getInventoryLevel(v.id);
      return [v.id, level.availableForCorporate] as const;
    }),
  );
  const inventoryByVariantId = Object.fromEntries(inventoryEntries);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/catalogo"
        className="text-xs uppercase tracking-[0.2em] text-bolg-text/60 underline-offset-4 hover:text-bolg-text hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
          {product.category}
        </p>
        <h1 className="mt-3 text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
          {product.title}
        </h1>
        <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal text-bolg-text/75 sm:text-base">
          {product.description}
        </p>
      </header>

      <div className="mt-12">
        <ProductConfigurator
          product={product}
          inventoryByVariantId={inventoryByVariantId}
        />
      </div>
    </div>
  );
}
