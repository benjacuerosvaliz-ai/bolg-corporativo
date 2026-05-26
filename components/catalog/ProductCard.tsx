import Image from "next/image";
import Link from "next/link";
import type { CorporateProduct } from "@/lib/shopify/types";
import { formatCLP } from "@/lib/utils/money";
import { StockBadge, type StockScenario } from "./StockBadge";

type Props = {
  product: CorporateProduct;
  /** Stock total disponible para corporativo (suma de todas las variantes). */
  stockTotal: number;
};

/**
 * Threshold para considerar "stock inmediato" en el catálogo.
 * >10 unidades libres → tenemos lo suficiente para casi cualquier cotización
 * empezando desde el mínimo (10u). Sino se trata como "bajo pedido".
 */
const STOCK_READY_THRESHOLD = 10;

function stockScenario(stockTotal: number): StockScenario {
  if (stockTotal > STOCK_READY_THRESHOLD) return "ready";
  if (stockTotal > 0) return "partial";
  return "on_demand";
}

export function ProductCard({ product, stockTotal }: Props) {
  const lowestBreak = product.volumePricing[0];
  const scenario = stockScenario(stockTotal);

  return (
    <Link
      href={`/catalogo/${product.handle}` as never}
      className="group flex flex-col gap-3 sm:gap-4"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-bolg-image-bg-light">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <p className="text-[9px] uppercase tracking-[0.18em] text-bolg-text/50 sm:text-[10px] sm:tracking-[0.2em]">
          {product.category}
        </p>
        <h3 className="font-bolg-heading text-sm uppercase tracking-[0.06em] text-bolg-text sm:text-base sm:tracking-[0.08em]">
          {product.title}
        </h3>

        {/* Mobile: stack vertical (precio arriba, Mín abajo más chico).
            Desktop: lado a lado en una línea. Evita ahorcar el precio en el
            ancho de media columna de mobile (~165px). */}
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <p className="font-bolg-body text-xs normal-case tracking-normal text-bolg-text/80 sm:text-sm">
            Desde{" "}
            <span className="font-medium text-bolg-text">
              {lowestBreak ? formatCLP(lowestBreak.unitPriceNet) : "—"}
            </span>
            <span className="text-bolg-text/60"> / u</span>
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] text-bolg-text/50 sm:text-[10px] sm:tracking-[0.2em]">
            Mín {product.minQty}
          </p>
        </div>

        <StockBadge
          scenario={scenario}
          leadTimeDays={product.leadTimeDaysReorder}
          className="mt-1.5 sm:mt-2"
        />
      </div>
    </Link>
  );
}
