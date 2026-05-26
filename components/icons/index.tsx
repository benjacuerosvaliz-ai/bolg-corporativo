/**
 * Set de iconos inline para apoyo visual en páginas explicativas.
 *
 * Estilo:
 *  - Outline / stroke-based, no fill
 *  - stroke=1.5, currentColor para que respondan a className text-*
 *  - viewBox 24x24 estándar
 *  - sin redondeos exagerados — minimal coherente con la tipografía sans
 *    light + tracking-wide del resto del sitio
 *
 * Uso:
 *   <ConfigureIcon className="h-6 w-6 text-bolg-text" />
 */

type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// --- Pasos del flujo ---

/** 01 Configurar — sliders / ajustes */
export function ConfigureIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

/** 02 Cotizar — documento con líneas */
export function QuoteIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4" />
      <line x1="10" y1="12" x2="16" y2="12" />
      <line x1="10" y1="15" x2="16" y2="15" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

/** 03 Aprobar — checkmark dentro de círculo */
export function ApproveIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

/** 04 Producir/Despachar — camión */
export function DeliveryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.7" />
      <circle cx="17.5" cy="17.5" r="1.7" />
    </svg>
  );
}

// --- Lead time ---

/** Bolt — stock inmediato, rápido */
export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
    </svg>
  );
}

/** Calendar — fechas largas, producción */
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="5" width="16" height="16" rx="1" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="9" y1="3" x2="9" y2="7" />
      <line x1="15" y1="3" x2="15" y2="7" />
      <circle cx="9" cy="15" r="0.5" fill="currentColor" />
      <circle cx="13" cy="15" r="0.5" fill="currentColor" />
      <circle cx="17" cy="15" r="0.5" fill="currentColor" />
    </svg>
  );
}

// --- Condiciones comerciales ---

/** Stack — unidades / cantidad */
export function StackIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8l9-4 9 4-9 4-9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 16l9 4 9-4" />
    </svg>
  );
}

/** Split 50/50 — círculo dividido */
export function SplitIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M7 9c1 2 1 4 0 6" />
      <path d="M17 9c-1 2-1 4 0 6" />
    </svg>
  );
}

/** Receipt — factura */
export function ReceiptIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

/** Hourglass — validez / tiempo limitado */
export function HourglassIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9" />
      <path d="M17 3c0 5-5 6-5 9s5 4 5 9" />
    </svg>
  );
}

// --- Value props casos-de-exito ---

/** Handshake — uso real / aceptación */
export function HandshakeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 11l3-3 4 1 4 4-2 2-3-2" />
      <path d="M21 11l-3-3-4 1" />
      <path d="M10 13l4 4" />
      <path d="M14 13l2 2" />
    </svg>
  );
}

/** Pencil — diseño / personalización con criterio */
export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 4l6 6-11 11H3v-6z" />
      <path d="M13 5l6 6" />
    </svg>
  );
}

/** Chart — stock real / data en tiempo real */
export function ChartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 20h18" />
      <rect x="5" y="13" width="3" height="7" />
      <rect x="11" y="8" width="3" height="12" />
      <rect x="17" y="4" width="3" height="16" />
    </svg>
  );
}

/** Diamond — premium */
export function DiamondIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h12l3 6-9 12-9-12z" />
      <path d="M6 3l3 6h6l3-6" />
      <path d="M9 9l3 12 3-12" />
    </svg>
  );
}
