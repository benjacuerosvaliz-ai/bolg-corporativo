import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import type { CartLine } from "./storage";
import { formatCLP, IVA_RATE } from "@/lib/utils/money";

/**
 * Generación del PDF profesional de cotización corporativa.
 *
 * Stack: @react-pdf/renderer corre server-side, no usa DOM. La salida es un
 * Buffer/Uint8Array que se puede attachear al email o devolver como descarga.
 */

// Mona Sans desde Google Fonts (mismo font que el sitio).
// React-PDF necesita registrar fuentes explícitamente para usar en el PDF.
Font.register({
  family: "Mona Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/monasans/v8/uYxJTjzdMyZQrl9MhM7yj9rwzwLBHvLE-fbcL.ttf",
      fontWeight: 300,
    },
    {
      src: "https://fonts.gstatic.com/s/monasans/v8/uYxJTjzdMyZQrl9MhM7yj9rwzwLBHvLE-fbcL.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/monasans/v8/uYxJTjzdMyZQrl9MhM7yj9rwzwLBHvLE-fbcL.ttf",
      fontWeight: 600,
    },
  ],
});

const colors = {
  text: "#2d2a26",
  textMuted: "#6e6960",
  border: "#e8e8e1",
  bg: "#ffffff",
  bgMuted: "#f6f6f3",
  accent: "#682d2d",
} as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
    padding: 48,
    paddingBottom: 64,
  },
  // --- Header ---
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: 4,
    color: colors.text,
  },
  brandSub: {
    fontSize: 7,
    letterSpacing: 3,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: "uppercase",
  },
  quoteMetaCol: {
    alignItems: "flex-end",
  },
  quoteNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 1,
    color: colors.text,
  },
  quoteMetaItem: {
    fontSize: 7,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // --- Section headings ---
  sectionLabel: {
    fontSize: 7,
    letterSpacing: 2,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: colors.text,
    marginBottom: 14,
  },
  // --- Customer block ---
  customerBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginBottom: 24,
  },
  customerRow: {
    flexDirection: "row",
    gap: 24,
  },
  customerCol: {
    flex: 1,
  },
  customerName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  customerLine: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 2,
  },
  // --- Lines table ---
  table: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    fontSize: 7,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellProduct: { width: "44%", paddingRight: 8, flexDirection: "row" },
  cellQty: { width: "10%", textAlign: "right" },
  cellUnit: { width: "22%", textAlign: "right" },
  cellTotal: { width: "24%", textAlign: "right" },
  thumb: {
    width: 38,
    height: 38,
    marginRight: 8,
    objectFit: "contain",
    backgroundColor: colors.bgMuted,
  },
  productInfo: { flex: 1 },
  productTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: colors.text,
    marginBottom: 3,
  },
  productMeta: {
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 1,
  },
  // --- Totals block ---
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsRowGrand: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.text,
    marginTop: 4,
  },
  totalsLabel: { color: colors.textMuted, fontSize: 9 },
  totalsValue: { color: colors.text, fontSize: 9 },
  totalsLabelGrand: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.text,
    textTransform: "uppercase",
  },
  totalsValueGrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: colors.text,
  },
  // --- Terms ---
  termsBlock: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  termsTitle: {
    fontSize: 7,
    letterSpacing: 2,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  termsList: {
    fontSize: 8,
    color: colors.text,
    lineHeight: 1.5,
  },
  termItem: {
    marginBottom: 4,
  },
  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export type QuotePDFInput = {
  quoteNumber: string;
  createdAt: Date;
  validityDays: number;
  customer: {
    companyName: string;
    rut: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
  };
  lines: CartLine[];
};

function formatDateLong(d: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function QuotePDF({
  quoteNumber,
  createdAt,
  validityDays,
  customer,
  lines,
}: QuotePDFInput) {
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.subtotalNet, 0);
  const iva = subtotalNet * IVA_RATE;
  const totalGross = subtotalNet + iva;
  const validUntil = new Date(createdAt);
  validUntil.setDate(validUntil.getDate() + validityDays);
  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <Document
      title={`Cotización ${quoteNumber} · BØLG Corporativo`}
      author="BØLG Concept"
      subject="Cotización corporativa BØLG"
    >
      <Page size="A4" style={styles.page}>
        {/* Header con marca + datos de la cotización */}
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>BØLG</Text>
            <Text style={styles.brandSub}>Corporativo · Cotización</Text>
          </View>
          <View style={styles.quoteMetaCol}>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>
            <Text style={styles.quoteMetaItem}>Emitida {formatDateLong(createdAt)}</Text>
            <Text style={styles.quoteMetaItem}>Válida hasta {formatDateLong(validUntil)}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.customerBlock}>
          <Text style={styles.sectionLabel}>Cliente</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerCol}>
              <Text style={styles.customerName}>{customer.companyName}</Text>
              <Text style={styles.customerLine}>RUT {customer.rut}</Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.customerLine}>{customer.contactName}</Text>
              <Text style={styles.customerLine}>{customer.contactEmail}</Text>
              {customer.contactPhone && (
                <Text style={styles.customerLine}>{customer.contactPhone}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tabla de líneas */}
        <Text style={styles.sectionTitle}>Detalle de productos</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellProduct]}>Producto</Text>
            <Text style={[styles.tableHeaderCell, styles.cellQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.cellUnit]}>Unitario neto</Text>
            <Text style={[styles.tableHeaderCell, styles.cellTotal]}>Total bruto</Text>
          </View>
          {lines.map((line) => {
            const unitTotal =
              line.pricing.unitPriceNet + line.pricing.customizationUnitPrice;
            return (
              <View key={line.id} style={styles.tableRow} wrap={false}>
                <View style={styles.cellProduct}>
                  {/* Thumbnail del producto + textos al lado, para que el
                      cliente recuerde visualmente qué cotizó. react-pdf
                      descarga la imagen del CDN al generar el PDF. */}
                  {line.productImageUrl ? (
                    <Image src={line.productImageUrl} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumb} />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{line.productTitle}</Text>
                    <Text style={styles.productMeta}>
                      {line.productCategory} · Variante: {line.variantTitle}
                    </Text>
                    <Text style={styles.productMeta}>
                      Técnica: {line.techniqueLabel} · Zona: {line.areaLabel}
                    </Text>
                    <Text style={styles.productMeta}>
                      Fecha objetivo: {formatDateLong(new Date(line.requiredDate))}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cellQty}>{line.quantity}</Text>
                <Text style={styles.cellUnit}>{formatCLP(unitTotal)}</Text>
                <Text style={styles.cellTotal}>{formatCLP(line.pricing.totalGross)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {lines.length} {lines.length === 1 ? "línea" : "líneas"} · {totalUnits} unidades
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal neto</Text>
            <Text style={styles.totalsValue}>{formatCLP(subtotalNet)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>IVA 19%</Text>
            <Text style={styles.totalsValue}>{formatCLP(iva)}</Text>
          </View>
          <View style={styles.totalsRowGrand}>
            <Text style={styles.totalsLabelGrand}>Total bruto</Text>
            <Text style={styles.totalsValueGrand}>{formatCLP(totalGross)}</Text>
          </View>
        </View>

        {/* Términos comerciales */}
        <View style={styles.termsBlock}>
          <Text style={styles.termsTitle}>Condiciones comerciales</Text>
          <View style={styles.termsList}>
            <Text style={styles.termItem}>
              · Mockup digital del logo aplicado se envía para aprobación antes de producir.
            </Text>
            <Text style={styles.termItem}>
              · Forma de pago habitual: 50% al confirmar la orden, 50% antes del despacho.
            </Text>
            <Text style={styles.termItem}>
              · Para productos sin stock inmediato, lead time desde origen ~150 días.
            </Text>
            <Text style={styles.termItem}>
              · Despacho a todo Chile vía partner logístico (costo a confirmar según volumen y destino).
            </Text>
            <Text style={styles.termItem}>
              · Validez de esta cotización: {validityDays} días desde la fecha de emisión.
            </Text>
            <Text style={styles.termItem}>
              · Emitimos factura electrónica a nombre de la empresa (necesitamos razón social, RUT y giro).
            </Text>
          </View>
        </View>

        {/* Footer fijo */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>BØLG Concept · corporativo.bolg.cl</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

/** Renderiza el PDF a Buffer/Uint8Array para attacheo a email. */
export async function renderQuotePDFBuffer(
  input: QuotePDFInput,
): Promise<Buffer> {
  const stream = await pdf(<QuotePDF {...input} />).toBuffer();
  // toBuffer() devuelve un NodeJS.ReadableStream. Lo consumimos a Buffer.
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
