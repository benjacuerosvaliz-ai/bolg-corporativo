"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { PrintArea, ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  productImage: ShopifyImage;
  area: PrintArea | null;
  logoUrl: string | null;
};

/** Tamaño del canvas. Se escala manteniendo aspect-ratio. */
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

/**
 * Centra y escala el logo dentro del bounding box del polígono de la zona,
 * manteniendo el aspect ratio del logo.
 */
function autoFitLogo(
  logoImg: HTMLImageElement,
  polygon: Array<[number, number]>,
): LogoBox {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const areaW = maxX - minX;
  const areaH = maxY - minY;

  const logoAspect = logoImg.width / logoImg.height;
  const areaAspect = areaW / areaH;

  let width: number;
  let height: number;
  if (logoAspect > areaAspect) {
    width = areaW;
    height = areaW / logoAspect;
  } else {
    height = areaH;
    width = areaH * logoAspect;
  }

  return {
    x: minX + (areaW - width) / 2,
    y: minY + (areaH - height) / 2,
    width,
    height,
    rotation: 0,
  };
}

function polygonBounds(polygon: Array<[number, number]>) {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function LivePreview({ productImage, area, logoUrl }: Props) {
  const productImg = useHtmlImage(productImage.url);
  const logoImg = useHtmlImage(logoUrl);

  const [logoBox, setLogoBox] = useState<LogoBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const logoRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Cuando llega un logo nuevo o cambia la zona, auto-fit.
  useEffect(() => {
    if (logoImg && area) {
      setLogoBox(autoFitLogo(logoImg, area.areaPolygon));
    } else {
      setLogoBox(null);
    }
  }, [logoImg, area]);

  // Adjunta el Transformer cuando el logo está listo.
  useEffect(() => {
    if (transformerRef.current && logoRef.current) {
      transformerRef.current.nodes([logoRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [logoBox, logoImg]);

  // El stage usa CANVAS_SIZE × CANVAS_SIZE como dominio interno.
  // La imagen del producto se escala al tamaño del stage.
  const productNaturalAspect =
    productImg && productImg.height > 0
      ? productImg.width / productImg.height
      : 1;
  const productDrawW =
    productNaturalAspect > 1 ? CANVAS_SIZE : CANVAS_SIZE * productNaturalAspect;
  const productDrawH =
    productNaturalAspect > 1 ? CANVAS_SIZE / productNaturalAspect : CANVAS_SIZE;
  const productX = (CANVAS_SIZE - productDrawW) / 2;
  const productY = (CANVAS_SIZE - productDrawH) / 2;

  // Tamaño en cm reales del logo según pxPerCm del PrintArea.
  const sizeCm =
    area && logoBox
      ? {
          w: (logoBox.width / area.pxPerCm).toFixed(1),
          h: (logoBox.height / area.pxPerCm).toFixed(1),
        }
      : null;

  // Validar si el logo sobresale del polígono (bounding box).
  const outOfBounds =
    area && logoBox
      ? (() => {
          const b = polygonBounds(area.areaPolygon);
          return (
            logoBox.x < b.minX - 1 ||
            logoBox.y < b.minY - 1 ||
            logoBox.x + logoBox.width > b.maxX + 1 ||
            logoBox.y + logoBox.height > b.maxY + 1
          );
        })()
      : false;

  const resetLogo = () => {
    if (logoImg && area) {
      setLogoBox(autoFitLogo(logoImg, area.areaPolygon));
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-bolg-card bg-bolg-image-bg-light"
        style={{ aspectRatio: "1 / 1" }}
      >
        <Stage
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 h-full w-full"
          style={{
            width: "100%",
            height: "100%",
          }}
          scale={{ x: 1, y: 1 }}
        >
          <Layer listening={false}>
            {productImg && (
              <KonvaImage
                image={productImg}
                x={productX}
                y={productY}
                width={productDrawW}
                height={productDrawH}
              />
            )}
            {area && (
              <Line
                points={area.areaPolygon.flat()}
                closed
                stroke="#682d2d"
                strokeWidth={2}
                dash={[10, 6]}
                opacity={0.7}
              />
            )}
          </Layer>
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
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(e) => {
                    setIsDragging(false);
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
                {/* Overlay rojo si sale del polígono */}
                {outOfBounds && (
                  <Rect
                    x={logoBox.x}
                    y={logoBox.y}
                    width={logoBox.width}
                    height={logoBox.height}
                    stroke="#ff4e4e"
                    strokeWidth={3}
                    listening={false}
                  />
                )}
              </>
            )}
          </Layer>
        </Stage>

        {!logoImg && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-bolg-card border border-bolg-border bg-bolg-bg/95 px-4 py-3 text-center backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
                Sube tu logo para previsualizarlo
              </p>
            </div>
          </div>
        )}
      </div>

      {logoBox && area && sizeCm && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-bolg-card border bg-bolg-bg px-4 py-3",
            outOfBounds ? "border-bolg-error" : "border-bolg-border",
          )}
        >
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/60">
              Tu logo en {area.label}
            </span>
            <span className="font-bolg-heading text-base font-light text-bolg-text">
              {sizeCm.w} × {sizeCm.h} cm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-bolg-text/50 sm:inline">
              máx {area.maxWidthCm} × {area.maxHeightCm} cm
            </span>
            <button
              type="button"
              onClick={resetLogo}
              className="rounded-bolg-button border border-bolg-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-bolg-text/70 transition hover:border-bolg-text hover:text-bolg-text"
            >
              Auto-ajustar
            </button>
          </div>

          {outOfBounds && (
            <p className="basis-full text-xs text-bolg-error">
              El logo se sale del área permitida. Click en "Auto-ajustar" para centrar y reescalar al máximo.
            </p>
          )}
        </div>
      )}

      {isDragging && (
        <p className="text-[10px] uppercase tracking-[0.18em] text-bolg-text/50">
          Arrastrando…
        </p>
      )}
    </div>
  );
}
