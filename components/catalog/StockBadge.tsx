import { cn } from "@/lib/utils/cn";

export type StockScenario = "ready" | "partial" | "on_demand";

type Props = {
  scenario: StockScenario;
  leadTimeDays?: number;
  className?: string;
};

const COPY: Record<StockScenario, { dot: string; label: string }> = {
  ready: { dot: "bg-emerald-500", label: "Stock inmediato" },
  partial: { dot: "bg-amber-500", label: "Stock parcial" },
  on_demand: { dot: "bg-sky-500", label: "Bajo pedido" },
};

export function StockBadge({ scenario, leadTimeDays, className }: Props) {
  const c = COPY[scenario];
  const suffix =
    scenario === "on_demand" && leadTimeDays ? ` · ${leadTimeDays} d` : "";
  return (
    <span
      className={cn(
        // Tracking más cerrado en mobile para que "Bajo pedido · 150 d" quepa
        // en una sola línea dentro del ancho de media columna.
        "inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-bolg-text/70 sm:gap-2 sm:text-[10px] sm:tracking-[0.2em]",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} aria-hidden />
      {c.label}
      {suffix}
    </span>
  );
}
