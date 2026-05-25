"use client";

import { useId } from "react";

const OCCASIONS = [
  "Regalo navideño",
  "Evento corporativo",
  "Onboarding",
  "Aniversario",
  "Otro",
] as const;

type Props = {
  value: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
  occasion: string | null;
  onOccasionChange: (occasion: string | null) => void;
};

export function TimelineSelector({
  value,
  onChange,
  occasion,
  onOccasionChange,
}: Props) {
  const dateId = useId();
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor={dateId}
          className="text-xs uppercase tracking-[0.2em] text-bolg-text/60"
        >
          ¿Para qué fecha necesitas el producto?
        </label>
        <input
          id={dateId}
          type="date"
          min={todayIso}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 block h-12 w-full rounded-bolg-input border border-bolg-border bg-bolg-bg px-4 font-bolg-body text-base normal-case tracking-normal text-bolg-text outline-none focus:border-bolg-text"
        />
      </div>

      <div>
        <span className="text-xs uppercase tracking-[0.2em] text-bolg-text/60">
          Contexto (opcional)
        </span>
        <div className="mt-3 flex flex-wrap gap-2">
          {OCCASIONS.map((opt) => {
            const isActive = occasion === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onOccasionChange(isActive ? null : opt)}
                className={
                  "rounded-bolg-button border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition " +
                  (isActive
                    ? "border-bolg-text bg-bolg-text text-bolg-button-text"
                    : "border-bolg-border bg-bolg-bg text-bolg-text/70 hover:border-bolg-text hover:text-bolg-text")
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
