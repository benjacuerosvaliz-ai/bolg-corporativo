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
        "inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-bolg-text/70",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} aria-hidden />
      {c.label}
      {suffix}
    </span>
  );
}
