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
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-10 lg:py-24">
      <header className="border-b border-bolg-border pb-6 sm:pb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-bolg-text/60 sm:text-xs">
          Catálogo corporativo
        </p>
        <h1 className="mt-3 max-w-3xl text-2xl font-light leading-[1.1] sm:mt-4 sm:text-3xl lg:text-5xl">
          Productos elegibles para cotización con tu logo.
        </h1>
        <p className="mt-3 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70 sm:mt-4 sm:text-base">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          {filtered.length !== all.length ? ` de ${all.length} totales` : ""}.
          Click en cualquiera para configurar técnica, cantidad y zona de impresión.
        </p>
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
