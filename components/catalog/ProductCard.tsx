import Image from "next/image";
import Link from "next/link";
import type { CorporateProduct } from "@/lib/shopify/types";
import { formatCLP } from "@/lib/utils/money";
import { StockBadge, type StockScenario } from "./StockBadge";

type Props = {
  product: CorporateProduct;
};

/**
 * Stock scenario aproximado en Fase 1 (sin Admin API todavía).
 * Heurística: si algún variant.id incluye "high" → ready,
 *             si incluye "low" + hay otros → partial,
 *             sino → on_demand.
 *
 * En Fase 2 cuando consultamos el Admin API real, esto pasa a calcularse
 * por cantidad solicitada vs inventory level real con buffer.
 */
function approxStock(product: CorporateProduct): StockScenario {
  const hasHigh = product.variants.some((v) => v.id.includes("high"));
  const hasLow = product.variants.some((v) => v.id.includes("low"));
  if (hasHigh && !hasLow) return "ready";
  if (hasHigh && hasLow) return "partial";
  return "on_demand";
}

export function ProductCard({ product }: Props) {
  const lowestBreak = product.volumePricing[0];
  const stock = approxStock(product);

  return (
    <Link
      href={`/catalogo/${product.handle}` as never}
      className="group flex flex-col gap-4"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-bolg-image-bg-light">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
          {product.category}
        </p>
        <h3 className="font-bolg-heading text-base uppercase tracking-[0.08em] text-bolg-text">
          {product.title}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="font-bolg-body text-sm normal-case tracking-normal text-bolg-text/80">
            Desde{" "}
            <span className="font-medium text-bolg-text">
              {lowestBreak ? formatCLP(lowestBreak.unitPriceNet) : "—"}
            </span>
            <span className="text-bolg-text/60"> / unidad</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-bolg-text/50">
            Mín {product.minQty}
          </p>
        </div>

        <StockBadge
          scenario={stock}
          leadTimeDays={product.leadTimeDaysReorder}
          className="mt-2"
        />
      </div>
    </Link>
  );
}
