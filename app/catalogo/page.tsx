import type { Metadata } from "next";
import { listCorporateProducts } from "@/lib/shopify/storefront";
import { getProductTotalStock } from "@/lib/shopify/admin";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  CatalogFilters,
  applyFilters,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogFilters";

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

  // Pre-fetch stock total por producto (Promise.all en paralelo).
  // Cada producto suma todas sus variantes.
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
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <header className="border-b border-bolg-border pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/60">
          Catálogo corporativo
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
          Productos elegibles para cotización con tu logo.
        </h1>
        <p className="mt-4 max-w-2xl font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70 sm:text-base">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          {filtered.length !== all.length ? ` de ${all.length} totales` : ""}.
          Click en cualquiera para configurar técnica, cantidad y zona de impresión.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
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
  const sort = get("sort");
  return {
    category: get("category"),
    technique: get("technique"),
    inStock: get("inStock"),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "relevance"
        ? sort
        : undefined,
  };
}
