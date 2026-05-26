import type { Metadata } from "next";
import { listCorporateProducts } from "@/lib/shopify/storefront";
import { getProductTotalStock } from "@/lib/shopify/admin";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  CatalogFilters,
  applyFilters,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogFilters";
import { CatalogFiltersMobile } from "@/components/catalog/CatalogFiltersMobile";
import Image from "next/image";

// Catálogo siempre dinámico para reflejar stock real + cambios de metafields
// sin caché agresiva.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo corporativo",
  description:
    "Catálogo BØLG para empresas: mochilas, botellas, vestuario y accesorios. Cotiza con tu logo, precios por volumen y stock real.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const active = normalize(sp);
  const all = await listCorporateProducts();

  const stockEntries = await Promise.all(
    all.map(async (p) => {
      const variantIds = p.variants.map((v) => v.id);
      const total = await getProductTotalStock(variantIds);
      return [p.id, total] as const;
    }),
  );
  const stockByProductId = Object.fromEntries(stockEntries);

  const filtered = applyFilters(all, active, stockByProductId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 sm:py-8 lg:px-10 lg:py-12">
      {/*
        Header minimal: lockup BØLG Corporativo centrado + UNA línea de
        microcopy abajo. El h1 se mantiene por SEO/a11y pero como texto
        chico junto al resto de la info (mínimo, despacho).
      */}
      <header className="flex flex-col items-center border-b border-bolg-border pb-6 text-center sm:pb-8">
        <Image
          src="/brand/bolg-corporativo-lockup.png"
          alt="BØLG Corporativo"
          width={1902}
          height={936}
          priority
          className="h-20 w-auto sm:h-24 lg:h-28"
        />
        <h1 className="mt-4 font-bolg-body text-xs normal-case tracking-normal text-bolg-text/70 sm:mt-5 sm:text-sm">
          Personaliza con tu logo · Mínimo 10 unidades · Despacho a todo Chile
        </h1>
      </header>

      {/* Mobile: filtros colapsados detrás de botón. Por default vienen
          los 49 productos visibles desde arriba sin scrolls extra. */}
      <div className="mt-6 lg:hidden">
        <CatalogFiltersMobile
          active={active}
          totalProducts={all.length}
          filteredCount={filtered.length}
        >
          <CatalogFilters products={all} active={active} />
        </CatalogFiltersMobile>
      </div>

      {/* Desktop: 2-col layout con sidebar sticky de filtros */}
      <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <CatalogFilters products={all} active={active} />
        </div>
        <ProductGrid products={filtered} stockByProductId={stockByProductId} />
      </div>
    </div>
  );
}

function normalize(
  sp: Record<string, string | string[] | undefined>,
): CatalogSearchParams {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  // Default visual = price_desc. URLs viejas con sort=relevance o sort=price_desc
  // se descartan a undefined (mismo efecto). Sólo price_asc se preserva.
  const sort = get("sort");
  return {
    category: get("category"),
    technique: get("technique"),
    inStock: get("inStock"),
    sort: sort === "price_asc" ? "price_asc" : undefined,
  };
}
