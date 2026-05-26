/* eslint-disable @next/next/no-head-element -- HTML email, no es una página Next */
import type { CartLine } from "@/lib/quote/storage";
import { formatCLP, IVA_RATE } from "@/lib/utils/money";

/**
 * Email transaccional al cliente cuando termina su cotización.
 *
 * Diseño: tabla simple, sin grids ni flex (Outlook los rompe). Estilos inline,
 * paleta BØLG (texto #2d2a26, accent #682d2d). El PDF formal va como attachment
 * en la request a Resend; este mail es la cara visible que llega al inbox.
 */

export type QuoteCreatedProps = {
  quoteNumber: string;
  createdAt: Date;
  validityDays: number;
  customer: {
    companyName: string;
    contactName: string;
    contactEmail: string;
  };
  lines: CartLine[];
};

const palette = {
  text: "#2d2a26",
  textMuted: "#6e6960",
  border: "#e8e8e1",
  bg: "#ffffff",
  bgMuted: "#f6f6f3",
  accent: "#682d2d",
};

const fontStack = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function QuoteCreated({
  quoteNumber,
  createdAt,
  validityDays,
  customer,
  lines,
}: QuoteCreatedProps) {
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.subtotalNet, 0);
  const iva = subtotalNet * IVA_RATE;
  const totalGross = subtotalNet + iva;
  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0);

  const validUntil = new Date(createdAt);
  validUntil.setDate(validUntil.getDate() + validityDays);

  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cotización {quoteNumber} · BØLG Corporativo</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: palette.bgMuted,
          fontFamily: fontStack,
          color: palette.text,
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: palette.bgMuted, padding: "32px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 600,
                    width: "100%",
                    backgroundColor: palette.bg,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <tbody>
                    {/* Header marca */}
                    <tr>
                      <td
                        style={{
                          padding: "32px 32px 16px",
                          borderBottom: `1px solid ${palette.border}`,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 22,
                            letterSpacing: "0.18em",
                            fontWeight: 300,
                            color: palette.text,
                          }}
                        >
                          BØLG
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 10,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Corporativo · Cotización
                        </p>
                      </td>
                    </tr>

                    {/* Saludo */}
                    <tr>
                      <td style={{ padding: "28px 32px 8px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Cotización {quoteNumber}
                        </p>
                        <h1
                          style={{
                            margin: "12px 0 0",
                            fontSize: 24,
                            fontWeight: 300,
                            lineHeight: 1.2,
                            color: palette.text,
                          }}
                        >
                          Hola {customer.contactName.split(" ")[0]}, recibimos tu
                          cotización.
                        </h1>
                        <p
                          style={{
                            margin: "16px 0 0",
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: palette.text,
                          }}
                        >
                          Gracias por considerar a BØLG para los regalos
                          corporativos de <strong>{customer.companyName}</strong>.
                          Adjuntamos el PDF formal con el detalle de los productos
                          y los términos comerciales.
                        </p>
                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: palette.text,
                          }}
                        >
                          Nuestro equipo comercial revisará tu requerimiento y te
                          escribirá el mismo día hábil para confirmar lead time,
                          stock por talla/color y, si corresponde, hacer el
                          mockup digital del logo aplicado.
                        </p>
                      </td>
                    </tr>

                    {/* Resumen */}
                    <tr>
                      <td style={{ padding: "24px 32px 8px" }}>
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: 11,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Resumen
                        </p>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            borderTop: `1px solid ${palette.border}`,
                            borderBottom: `1px solid ${palette.border}`,
                          }}
                        >
                          <tbody>
                            <SummaryRow
                              label={`${lines.length} ${lines.length === 1 ? "línea" : "líneas"} · ${totalUnits} unidades`}
                              value=""
                              muted
                            />
                            <SummaryRow
                              label="Subtotal neto"
                              value={formatCLP(subtotalNet)}
                            />
                            <SummaryRow
                              label="IVA 19%"
                              value={formatCLP(iva)}
                              muted
                            />
                            <SummaryRow
                              label="Total bruto"
                              value={formatCLP(totalGross)}
                              emphasis
                            />
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Validez */}
                    <tr>
                      <td style={{ padding: "16px 32px 8px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            lineHeight: 1.55,
                            color: palette.textMuted,
                          }}
                        >
                          Esta cotización es válida hasta el{" "}
                          <strong style={{ color: palette.text }}>
                            {formatDateLong(validUntil)}
                          </strong>
                          . Los precios pueden ajustarse después de esa fecha
                          según costos y disponibilidad del proveedor.
                        </p>
                      </td>
                    </tr>

                    {/* Próximos pasos */}
                    <tr>
                      <td style={{ padding: "24px 32px" }}>
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: 11,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Próximos pasos
                        </p>
                        <ol
                          style={{
                            margin: 0,
                            paddingLeft: 18,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: palette.text,
                          }}
                        >
                          <li>Revisamos disponibilidad real por talla/color.</li>
                          <li>Confirmamos lead time y fecha de despacho.</li>
                          <li>Te enviamos el mockup digital con tu logo aplicado.</li>
                          <li>
                            Confirmas y emitimos la orden con la forma de pago
                            acordada (50% / 50% es lo habitual).
                          </li>
                        </ol>
                      </td>
                    </tr>

                    {/* CTA secundario */}
                    <tr>
                      <td style={{ padding: "0 32px 32px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: 1.55,
                            color: palette.text,
                          }}
                        >
                          ¿Necesitas ajustar algo? Responde este correo y nos
                          coordinamos directamente. También puedes escribir a{" "}
                          <a
                            href="mailto:cotizaciones@bolg.cl"
                            style={{ color: palette.accent, textDecoration: "none" }}
                          >
                            cotizaciones@bolg.cl
                          </a>
                          .
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: "20px 32px",
                          borderTop: `1px solid ${palette.border}`,
                          backgroundColor: palette.bgMuted,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          BØLG Concept · corporativo.bolg.cl
                        </p>
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 10,
                            color: palette.textMuted,
                          }}
                        >
                          Este correo se envió a {customer.contactEmail} porque
                          enviaste una cotización desde corporativo.bolg.cl.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasis?: boolean;
}) {
  const labelStyle: React.CSSProperties = {
    padding: emphasis ? "14px 0" : "8px 0",
    fontSize: emphasis ? 12 : 13,
    textTransform: emphasis ? "uppercase" : "none",
    letterSpacing: emphasis ? "0.18em" : "normal",
    color: muted ? palette.textMuted : palette.text,
  };
  const valueStyle: React.CSSProperties = {
    padding: emphasis ? "14px 0" : "8px 0",
    textAlign: "right",
    fontSize: emphasis ? 18 : 13,
    fontWeight: emphasis ? 300 : 400,
    color: muted ? palette.textMuted : palette.text,
  };
  return (
    <tr
      style={
        emphasis ? { borderTop: `1px solid ${palette.border}` } : undefined
      }
    >
      <td style={labelStyle}>{label}</td>
      <td style={valueStyle}>{value}</td>
    </tr>
  );
}

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
