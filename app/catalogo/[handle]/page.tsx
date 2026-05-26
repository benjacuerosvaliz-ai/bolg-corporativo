import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCorporateProductByHandle } from "@/lib/shopify/storefront";
import { getInventoryLevel } from "@/lib/shopify/admin";
import { ProductConfigurator } from "@/components/configurator/ProductConfigurator";

// La PDP siempre dinámica: stock + metafields cambian, y queremos que el
// switch USE_MOCK_PRODUCTS=true/false no quede atrapado en cache estática.
export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <Link
        href="/catalogo"
        className="text-xs uppercase tracking-[0.2em] text-bolg-text/60 underline-offset-4 hover:text-bolg-text hover:underline"
      >
        ← Volver al catálogo
      </Link>

      {/*
        Header compacto: solo categoría + título. La descripción larga se mueve
        abajo del configurador para no empujar el canvas fuera del viewport.
      */}
      <header className="mt-6 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
          {product.category}
        </p>
        <h1 className="mt-3 text-3xl font-light leading-[1.05] sm:text-4xl lg:text-5xl">
          {product.title}
        </h1>
      </header>

      <div className="mt-8">
        <ProductConfigurator
          product={product}
          inventoryByVariantId={inventoryByVariantId}
        />
      </div>

      {/* Sección "Sobre el producto" — descripción extendida abajo */}
      {product.descriptionHtml && (
        <section className="mt-20 border-t border-bolg-border pt-12">
          <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
            Sobre el producto
          </p>
          <div
            className="prose-bolg mt-6 max-w-3xl font-bolg-body text-base normal-case tracking-normal text-bolg-text/80 [&_a]:underline [&_a]:underline-offset-4 [&_img]:my-6 [&_img]:rounded-bolg-card [&_p]:mt-4 [&_p:first-child]:mt-0 [&_strong]:font-medium [&_strong]:text-bolg-text"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </section>
      )}
    </div>
  );
}
