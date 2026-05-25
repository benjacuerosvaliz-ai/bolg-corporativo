"use client";

import type {
  StockAnalysis as StockAnalysisType,
  GanttSegment,
  StockScenario,
} from "@/lib/quote/stock-analysis";
import { cn } from "@/lib/utils/cn";

type Props = {
  analysis: StockAnalysisType;
  requiredDate: Date;
};

const SCENARIO_META: Record<
  StockScenario,
  { label: string; dot: string; pill: string }
> = {
  ALL_IN_STOCK: {
    label: "Stock listo",
    dot: "bg-emerald-500",
    pill: "border-emerald-500/40 bg-emerald-50 text-emerald-900",
  },
  HYBRID_FEASIBLE: {
    label: "Stock + reposición",
    dot: "bg-sky-500",
    pill: "border-sky-500/40 bg-sky-50 text-sky-900",
  },
  HYBRID_TIGHT: {
    label: "Margen ajustado",
    dot: "bg-amber-500",
    pill: "border-amber-500/40 bg-amber-50 text-amber-900",
  },
  INFEASIBLE: {
    label: "No alcanza para tu fecha",
    dot: "bg-bolg-error",
    pill: "border-bolg-error/40 bg-bolg-error/10 text-bolg-error",
  },
};

const SEGMENT_COLORS: Record<GanttSegment["kind"], string> = {
  stock_ready: "bg-emerald-500",
  reorder: "bg-sky-500",
  personalization: "bg-amber-500",
  shipping: "bg-bolg-text/60",
};

const SEGMENT_LABELS: Record<GanttSegment["kind"], string> = {
  stock_ready: "Stock listo",
  reorder: "Reposición",
  personalization: "Personalización",
  shipping: "Despacho",
};

export function StockAnalysis({ analysis, requiredDate }: Props) {
  const meta = SCENARIO_META[analysis.scenario];

  return (
    <section className="rounded-bolg-card border border-bolg-border bg-bolg-bg p-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
          Análisis de stock + timeline
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-bolg-button border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]",
            meta.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
          {meta.label}
        </span>
      </header>

      <p className="mt-4 font-bolg-body text-sm normal-case tracking-normal leading-relaxed text-bolg-text">
        {analysis.recommendation}
      </p>

      <Gantt
        segments={analysis.ganttSegments}
        requiredDate={requiredDate}
        finalDeliveryDate={analysis.finalDeliveryDate}
      />

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Metric label="Stock listo" value={`${analysis.stockReady} u`} />
        <Metric
          label="Por reponer"
          value={analysis.stockMissing > 0 ? `${analysis.stockMissing} u` : "—"}
        />
        <Metric label="Entrega estimada" value={formatDateShort(analysis.finalDeliveryDate)} />
        <Metric
          label="Holgura"
          value={
            analysis.bufferDays >= 0
              ? `${analysis.bufferDays} d`
              : `−${Math.abs(analysis.bufferDays)} d`
          }
          emphasize={analysis.bufferDays < 0}
        />
      </dl>
    </section>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-bolg-heading text-base font-light",
          emphasize ? "text-bolg-error" : "text-bolg-text",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Gantt({
  segments,
  requiredDate,
  finalDeliveryDate,
}: {
  segments: GanttSegment[];
  requiredDate: Date;
  finalDeliveryDate: Date;
}) {
  if (segments.length === 0) return null;

  const start = segments[0]!.startDate.getTime();
  const lastEnd = segments[segments.length - 1]!.endDate.getTime();
  const required = requiredDate.getTime();
  const finalDelivery = finalDeliveryDate.getTime();

  // Eje total = desde el inicio hasta el max(requiredDate, finalDelivery) + 5% padding.
  const rightAnchor = Math.max(required, finalDelivery);
  const totalSpan = Math.max(1, rightAnchor - start);
  const paddedTotal = totalSpan * 1.05;

  const pct = (date: number): number => ((date - start) / paddedTotal) * 100;

  return (
    <div className="mt-6">
      <div className="relative h-12 w-full rounded-sm bg-bolg-image-bg-light">
        {segments.map((s, i) => {
          const left = pct(s.startDate.getTime());
          const width = Math.max(0.5, pct(s.endDate.getTime()) - left);
          return (
            <div
              key={`${s.kind}-${i}`}
              className={cn(
                "absolute top-1.5 bottom-1.5 rounded-[2px] opacity-90",
                SEGMENT_COLORS[s.kind],
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${s.label} · ${formatDateShort(s.startDate)} → ${formatDateShort(s.endDate)}`}
            />
          );
        })}

        {/* Marcador de fecha del cliente */}
        <div
          className="absolute -top-1 -bottom-1 w-px bg-bolg-error"
          style={{ left: `${pct(required)}%` }}
          aria-hidden
        />
        <span
          className="absolute -top-5 -translate-x-1/2 text-[9px] uppercase tracking-[0.15em] text-bolg-error"
          style={{ left: `${pct(required)}%` }}
        >
          Tu fecha
        </span>
      </div>

      {/* Leyenda */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
        {Array.from(new Set(segments.map((s) => s.kind))).map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-[1px]", SEGMENT_COLORS[kind])} />
            {SEGMENT_LABELS[kind]}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatDateShort(d: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
  }).format(d);
}
