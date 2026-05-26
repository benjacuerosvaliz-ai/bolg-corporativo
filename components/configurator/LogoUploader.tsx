"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Estado del logo cargado. previewUrl es para Konva/UI (object URL del browser);
 * dataUrl es base64 que persiste en localStorage y viaja al server para
 * adjuntarse al email. Ambos representan el mismo archivo.
 */
export type LogoState = {
  previewUrl: string;
  dataUrl: string;
  fileName: string;
  mimeType: string;
} | null;

type Props = {
  logo: LogoState;
  onChange: (logo: LogoState) => void;
};

const ACCEPTED_TYPES = ["image/png", "image/svg+xml", "image/jpeg"] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type ValidationError =
  | { kind: "type"; received: string }
  | { kind: "size"; received: number }
  | { kind: "lowres"; widthPx: number }
  | null;

export function LogoUploader({ logo, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<ValidationError>(null);
  const [warning, setWarning] = useState<ValidationError>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoUrl = logo?.previewUrl ?? null;
  const fileName = logo?.fileName ?? null;

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setWarning(null);

      if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
        setError({ kind: "type", received: file.type || "desconocido" });
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError({ kind: "size", received: file.size });
        return;
      }

      // Genero dos representaciones:
      //  - previewUrl (object URL): liviano, ideal para Konva/UI
      //  - dataUrl (base64): persiste en localStorage y se puede adjuntar
      //    a emails server-side cuando llegue la cotización
      const previewUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") return;
        onChange({
          previewUrl,
          dataUrl,
          fileName: file.name,
          mimeType: file.type,
        });
      };
      reader.onerror = () => {
        setError({ kind: "type", received: "no se pudo leer el archivo" });
      };
      reader.readAsDataURL(file);

      // Para PNG/JPG verificamos resolución mínima recomendada (1000px).
      // SVG es vectorial — siempre OK.
      if (file.type !== "image/svg+xml") {
        const img = new Image();
        img.onload = () => {
          if (img.width < 1000) {
            setWarning({ kind: "lowres", widthPx: img.width });
          }
        };
        img.src = previewUrl;
      }
    },
    [onChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onPickClick = () => inputRef.current?.click();

  const remove = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    onChange(null);
    setError(null);
    setWarning(null);
  };

  if (logoUrl) {
    return (
      <div className="rounded-bolg-card border border-bolg-text bg-bolg-image-bg-light p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-bolg-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo cargado"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
              Logo cargado
            </p>
            <p className="truncate font-bolg-body text-sm tracking-normal text-bolg-text">
              {fileName ?? "logo.png"}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60 underline-offset-4 hover:text-bolg-error hover:underline"
          >
            Quitar
          </button>
        </div>
        {warning?.kind === "lowres" && (
          <p className="mt-3 text-xs text-amber-700">
            Tu logo tiene {warning.widthPx}px de ancho. Para impresión recomendamos
            mín. 1000px o usar SVG (vectorial). Si bajas la calidad, puede verse pixeleado.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={onPickClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onPickClick();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-bolg-card border-2 border-dashed px-6 py-10 text-center transition",
          isDragging
            ? "border-bolg-text bg-bolg-image-bg-light"
            : "border-bolg-border bg-bolg-bg hover:border-bolg-text hover:bg-bolg-image-bg-light",
        )}
      >
        <span className="font-bolg-heading text-xs uppercase tracking-[0.2em] text-bolg-text">
          Sube tu logo
        </span>
        <p className="max-w-xs font-bolg-body text-xs normal-case tracking-normal text-bolg-text/65">
          Arrastra el archivo aquí o haz click para buscar. PNG, SVG o JPG. Recomendamos SVG o mín. 1000px de ancho.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-bolg-error">
          {error.kind === "type"
            ? `Formato no compatible (${error.received}). Acepta PNG, SVG o JPG.`
            : error.kind === "size"
              ? `Archivo muy pesado (${Math.round(error.received / 1024 / 1024)} MB). Máximo 10 MB.`
              : null}
        </p>
      )}
    </div>
  );
}
