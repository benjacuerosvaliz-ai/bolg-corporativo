"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";
import type { PrintArea, ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  productImage: ShopifyImage;
  /** Zona "principal" para referencia de cm reales. Puede ser null. */
  area: PrintArea | null;
  logoUrl: string | null;
};

/**
 * Tamaño interno del Stage Konva. CSS responsive lo escala al container,
 * la lógica interna trabaja en este sistema de coordenadas.
 */
const CANVAS_SIZE = 900;

type LogoBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

function useHtmlImage(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    el.onload = () => setImg(el);
    el.src = src;
    return () => {
      el.onload = null;
    };
  }, [src]);
  return img;
}

function initialLogoBox(logoImg: HTMLImageElement): LogoBox {
  const target = CANVAS_SIZE * 0.25;
  const logoAspect = logoImg.width / logoImg.height;
  const width = logoAspect >= 1 ? target : target * logoAspect;
  const height = logoAspect >= 1 ? target / logoAspect : target;
  return {
    x: (CANVAS_SIZE - width) / 2,
    y: (CANVAS_SIZE - height) / 2,
    width,
    height,
    rotation: 0,
  };
}

export function LivePreview({ productImage, area, logoUrl }: Props) {
  const logoImg = useHtmlImage(logoUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<number>(CANVAS_SIZE);

  // Observa el tamaño real del container para mantener el Stage responsive.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerSize(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [logoBox, setLogoBox] = useState<LogoBox | null>(null);
  const logoRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (logoImg) {
      setLogoBox(initialLogoBox(logoImg));
    } else {
      setLogoBox(null);
    }
  }, [logoImg]);

  useEffect(() => {
    if (transformerRef.current && logoRef.current) {
      transformerRef.current.nodes([logoRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [logoBox, logoImg]);

  // Factor de escala entre coordenadas internas (CANVAS_SIZE) y CSS.
  const scale = containerSize / CANVAS_SIZE;

  // Tamaño en cm reales (referencia visual, usando pxPerCm de la zona principal).
  const sizeCm =
    area && logoBox
      ? {
          w: (logoBox.width / area.pxPerCm).toFixed(1),
          h: (logoBox.height / area.pxPerCm).toFixed(1),
        }
      : null;

  const resetLogo = () => {
    if (logoImg) setLogoBox(initialLogoBox(logoImg));
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full overflow-hidden rounded-bolg-card bg-bolg-image-bg-light"
      >
        {/* Imagen del producto como background HTML (responsive nativo) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage.url}
          alt={productImage.altText ?? "Producto"}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* Stage Konva transparente encima, solo para el logo del cliente */}
        <Stage
          width={containerSize}
          height={containerSize}
          scaleX={scale}
          scaleY={scale}
          className="absolute inset-0"
        >
          <Layer>
            {logoImg && logoBox && (
              <>
                <KonvaImage
                  ref={(node) => {
                    logoRef.current = node;
                  }}
                  image={logoImg}
                  x={logoBox.x}
                  y={logoBox.y}
                  width={logoBox.width}
                  height={logoBox.height}
                  rotation={logoBox.rotation}
                  draggable
                  onDragEnd={(e) => {
                    setLogoBox({
                      ...logoBox,
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  onTransformEnd={() => {
                    const node = logoRef.current;
                    if (!node) return;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    setLogoBox({
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(20, node.width() * scaleX),
                      height: Math.max(20, node.height() * scaleY),
                      rotation: node.rotation(),
                    });
                  }}
                />
                <Transformer
                  ref={(node) => {
                    transformerRef.current = node;
                  }}
                  rotateEnabled
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  boundBoxFunc={(_, newBox) => {
                    if (newBox.width < 20 || newBox.height < 20) return _;
                    return newBox;
                  }}
                />
              </>
            )}
          </Layer>
        </Stage>

        {!logoImg && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="rounded-bolg-card border border-bolg-border bg-bolg-bg/95 px-4 py-2 text-center backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
                Sube tu logo para previsualizarlo
              </p>
            </div>
          </div>
        )}
      </div>

      {logoBox && sizeCm && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-bolg-card border border-bolg-border bg-bolg-bg px-4 py-3",
          )}
        >
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
              Tamaño de tu logo
            </span>
            <span className="font-bolg-heading text-base font-light text-bolg-text">
              {sizeCm.w} × {sizeCm.h} cm
            </span>
          </div>

          <button
            type="button"
            onClick={resetLogo}
            className="rounded-bolg-button border border-bolg-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-bolg-text/70 transition hover:border-bolg-text hover:text-bolg-text"
          >
            Centrar
          </button>
        </div>
      )}
    </div>
  );
}
