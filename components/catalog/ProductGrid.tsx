import type { CorporateProduct } from "@/lib/shopify/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: CorporateProduct[];
  /** Stock total por product.id. Pre-fetcheado server-side. */
  stockByProductId: Record<string, number>;
};

export function ProductGrid({ products, stockByProductId }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-bolg-border py-24 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-bolg-text/50">
          Sin resultados
        </p>
        <p className="mt-4 max-w-md font-bolg-body text-sm normal-case tracking-normal text-bolg-text/70">
          Ningún producto coincide con los filtros aplicados. Prueba quitando alguno
          o vuelve al catálogo completo.
        </p>
      </div>
    );
  }
  return (
    // 2 columnas en mobile (estándar ecommerce: ML, Falabella) para que los
    // 49 productos no requieran scroll eterno. Gap chico en mobile para que el
    // ancho de cada card no quede ahogado.
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          stockTotal={stockByProductId[product.id] ?? 0}
        />
      ))}
    </div>
  );
}
