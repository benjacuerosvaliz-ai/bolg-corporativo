import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { CorporateProduct } from "@/lib/shopify/types";

export type CatalogSearchParams = {
  category?: string;
  technique?: string;
  inStock?: string;
  sort?: "relevance" | "price_asc" | "price_desc";
};

type Props = {
  products: CorporateProduct[];
  active: CatalogSearchParams;
};

/**
 * Filtros server-side, sincronizados con la URL.
 *
 * Cada filtro renderea links a /catalogo?param=value para mantener el
 * estado en la URL (compartible, indexable, sin JS adicional).
 */
export function CatalogFilters({ products, active }: Props) {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const techniques = Array.from(
    new Set(products.flatMap((p) => p.printTechniques.map((t) => t.label))),
  ).sort();

  return (
    <aside className="space-y-10">
      <FilterGroup
        label="Categoría"
        items={[
          { label: "Todas", value: undefined, active: !active.category },
          ...categories.map((c) => ({
            label: c,
            value: c,
            active: active.category === c,
          })),
        ]}
        paramKey="category"
        current={active}
      />

      <FilterGroup
        label="Técnica de impresión"
        items={[
          { label: "Todas", value: undefined, active: !active.technique },
          ...techniques.map((t) => ({
            label: t,
            value: t,
            active: active.technique === t,
          })),
        ]}
        paramKey="technique"
        current={active}
      />

      <FilterGroup
        label="Stock"
        items={[
          { label: "Todo", value: undefined, active: !active.inStock },
          { label: "Solo stock inmediato", value: "ready", active: active.inStock === "ready" },
        ]}
        paramKey="inStock"
        current={active}
      />

      <FilterGroup
        label="Ordenar por"
        items={[
          { label: "Relevancia", value: undefined, active: !active.sort || active.sort === "relevance" },
          { label: "Precio: menor a mayor", value: "price_asc", active: active.sort === "price_asc" },
          { label: "Precio: mayor a menor", value: "price_desc", active: active.sort === "price_desc" },
        ]}
        paramKey="sort"
        current={active}
      />
    </aside>
  );
}

type FilterItem = { label: string; value: string | undefined; active: boolean };

function FilterGroup({
  label,
  items,
  paramKey,
  current,
}: {
  label: string;
  items: FilterItem[];
  paramKey: keyof CatalogSearchParams;
  current: CatalogSearchParams;
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
        {label}
      </h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const next: CatalogSearchParams = { ...current, [paramKey]: item.value };
          const qs = buildQuery(next);
          const href = qs ? `/catalogo?${qs}` : "/catalogo";
          return (
            <li key={`${paramKey}-${item.label}`}>
              <Link
                href={href as never}
                className={cn(
                  "block py-1 font-bolg-body text-sm normal-case tracking-normal transition",
                  item.active
                    ? "text-bolg-text underline underline-offset-4"
                    : "text-bolg-text/60 hover:text-bolg-text",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function buildQuery(p: CatalogSearchParams): string {
  const sp = new URLSearchParams();
  if (p.category) sp.set("category", p.category);
  if (p.technique) sp.set("technique", p.technique);
  if (p.inStock) sp.set("inStock", p.inStock);
  if (p.sort && p.sort !== "relevance") sp.set("sort", p.sort);
  return sp.toString();
}

export function applyFilters(
  products: CorporateProduct[],
  p: CatalogSearchParams,
): CorporateProduct[] {
  let out = [...products];
  if (p.category) out = out.filter((x) => x.category === p.category);
  if (p.technique) {
    out = out.filter((x) =>
      x.printTechniques.some((t) => t.label === p.technique),
    );
  }
  if (p.inStock === "ready") {
    out = out.filter((x) => x.variants.some((v) => v.id.includes("high")));
  }
  if (p.sort === "price_asc") {
    out.sort((a, b) => firstPrice(a) - firstPrice(b));
  } else if (p.sort === "price_desc") {
    out.sort((a, b) => firstPrice(b) - firstPrice(a));
  }
  return out;
}

function firstPrice(p: CorporateProduct): number {
  return p.volumePricing[0]?.unitPriceNet ?? 0;
}
