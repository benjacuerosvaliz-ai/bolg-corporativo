"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";
import type { PrintArea, ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils/cn";

/**
 * Handle imperativo expuesto al parent (ProductConfigurator) para capturar
 * el mockup compuesto al momento de agregar la línea al carrito. La captura
 * mergea el producto (img HTML normal) + el logo (Konva stage) en un canvas
 * temporal porque hoy son dos capas separadas en el DOM.
 *
 * Returns DataURL PNG o null si no hay logo / la captura falló (ej. CORS).
 */
export type LivePreviewHandle = {
  captureMockup: () => string | null;
};

type Props = {
  /** Imagen "preferida" para arrancar (definida por la zona seleccionada o la principal). */
  productImage: ShopifyImage;
  /** Todas las imágenes del producto. El cliente puede cambiar cuál ve via thumbnails. */
  allImages: ShopifyImage[];
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

export const LivePreview = forwardRef<LivePreviewHandle, Props>(
  function LivePreview({ productImage, allImages, area, logoUrl }, ref) {
  const logoImg = useHtmlImage(logoUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<number>(CANVAS_SIZE);

  // Galería: dedupe por URL y cap a 6 thumbnails para no saturar.
  // Algunos productos en Shopify tienen 8-10 imágenes (incluye lifestyle);
  // el cliente solo necesita ver opciones de "cara" para personalizar.
  const galleryImages = useMemo(() => {
    const seen = new Set<string>();
    const out: ShopifyImage[] = [];
    for (const img of allImages) {
      if (img.url && !seen.has(img.url)) {
        seen.add(img.url);
        out.push(img);
      }
      if (out.length >= 6) break;
    }
    return out;
  }, [allImages]);

  // Imagen actualmente seleccionada para mostrar en el canvas. Cambia cuando
  // el cliente clickea un thumbnail o cuando cambia la zona en el configurador.
  const [activeImageUrl, setActiveImageUrl] = useState<string>(productImage.url);

  // Si la zona seleccionada cambia (lo que actualiza productImage), syncar.
  useEffect(() => {
    setActiveImageUrl(productImage.url);
  }, [productImage.url]);

  // Versión HTMLImageElement (CORS-aware) del producto. La usa el captureMockup
  // para dibujar en el canvas temporal — el <img> visible del DOM no nos sirve
  // porque no podemos garantizar que tenga crossOrigin habilitado.
  const productImg = useHtmlImage(activeImageUrl);

  // ResizeObserver para hacer responsive el Stage interno.
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

  const scale = containerSize / CANVAS_SIZE;

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

  // Captura del mockup compuesto (producto + logo) a un canvas temporal y
  // devuelve DataURL PNG. Se invoca desde el padre vía ref al momento de
  // agregar la línea al carrito.
  useImperativeHandle(
    ref,
    () => ({
      captureMockup() {
        if (!productImg || !logoImg || !logoBox) return null;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = CANVAS_SIZE;
          canvas.height = CANVAS_SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;

          // Fondo del slot (mismo color que el container visible) para que el
          // mockup no quede transparente si el producto no llena el cuadrado.
          ctx.fillStyle = "#f6f6f3";
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

          // Producto con object-contain: respeta aspect ratio, se centra
          drawContained(ctx, productImg, CANVAS_SIZE, CANVAS_SIZE);

          // Logo con rotación: trasladamos al centro del logo, rotamos,
          // dibujamos centrado en 0,0
          ctx.save();
          ctx.translate(
            logoBox.x + logoBox.width / 2,
            logoBox.y + logoBox.height / 2,
          );
          ctx.rotate((logoBox.rotation * Math.PI) / 180);
          ctx.drawImage(
            logoImg,
            -logoBox.width / 2,
            -logoBox.height / 2,
            logoBox.width,
            logoBox.height,
          );
          ctx.restore();

          return canvas.toDataURL("image/png");
        } catch (err) {
          // Si Shopify CDN no devuelve CORS, toDataURL lanza SecurityError.
          // En ese caso devolvemos null y el flujo sigue sin mockup adjunto.
          console.warn("[LivePreview] captureMockup failed:", err);
          return null;
        }
      },
    }),
    [productImg, logoImg, logoBox],
  );

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full overflow-hidden rounded-bolg-card bg-bolg-image-bg-light"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImageUrl}
          alt={productImage.altText ?? "Producto"}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

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

      {/*
        Galería de thumbnails: deja al cliente elegir cuál cara del producto
        ve en el preview. Útil para llaveros / botellas / billeteras donde
        el grabado va por una cara distinta de la imagen principal.
      */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((img) => {
            const isActive = img.url === activeImageUrl;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveImageUrl(img.url)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[3px] border-2 bg-bolg-image-bg-light transition",
                  isActive
                    ? "border-bolg-text"
                    : "border-transparent hover:border-bolg-border",
                )}
                aria-label={`Ver ${img.altText ?? "cara del producto"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.altText ?? ""}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      )}

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
});

/**
 * Dibuja una imagen sobre un canvas respetando aspect ratio (object-contain).
 * Centra horizontal/verticalmente según corresponda. Idéntico al comportamiento
 * del <img className="object-contain"> que el cliente ve en pantalla.
 */
function drawContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
): void {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = canvasW / canvasH;
  let drawW: number;
  let drawH: number;
  let dx: number;
  let dy: number;
  if (imgAspect > canvasAspect) {
    drawW = canvasW;
    drawH = canvasW / imgAspect;
    dx = 0;
    dy = (canvasH - drawH) / 2;
  } else {
    drawH = canvasH;
    drawW = canvasH * imgAspect;
    dx = (canvasW - drawW) / 2;
    dy = 0;
  }
  ctx.drawImage(img, dx, dy, drawW, drawH);
}
