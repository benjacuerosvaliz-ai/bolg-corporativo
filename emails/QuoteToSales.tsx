/* eslint-disable @next/next/no-head-element -- HTML email, no es una página Next */
import type { CartLine } from "@/lib/quote/storage";
import { formatCLP, IVA_RATE } from "@/lib/utils/money";

/**
 * Notificación interna al equipo BØLG cuando entra una nueva cotización.
 *
 * Optimizado para acción: contacto del cliente arriba, tabla de productos
 * con técnica+zona+fecha objetivo, total bruto destacado. El PDF formal va
 * adjunto en la misma request (no se necesita reconstruir nada para responder
 * al cliente).
 */

export type QuoteToSalesProps = {
  quoteNumber: string;
  createdAt: Date;
  customer: {
    companyName: string;
    rut: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
  };
  occasion: string | null;
  notes: string | null;
  lines: CartLine[];
};

const palette = {
  text: "#2d2a26",
  textMuted: "#6e6960",
  border: "#e8e8e1",
  bg: "#ffffff",
  bgMuted: "#f6f6f3",
  accent: "#682d2d",
  highlight: "#fff8e1",
};

const fontStack = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function QuoteToSales({
  quoteNumber,
  createdAt,
  customer,
  occasion,
  notes,
  lines,
}: QuoteToSalesProps) {
  const subtotalNet = lines.reduce((s, l) => s + l.pricing.subtotalNet, 0);
  const iva = subtotalNet * IVA_RATE;
  const totalGross = subtotalNet + iva;
  const totalUnits = lines.reduce((s, l) => s + l.quantity, 0);

  // Fecha objetivo más cercana de las líneas (lo más urgente del lote).
  const earliestDate = lines
    .map((l) => l.requiredDate)
    .sort()[0];

  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          Nueva cotización {quoteNumber} · {customer.companyName}
        </title>
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
          style={{ backgroundColor: palette.bgMuted, padding: "24px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="640"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 640,
                    width: "100%",
                    backgroundColor: palette.bg,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          padding: "20px 28px",
                          backgroundColor: palette.text,
                          color: palette.bg,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            opacity: 0.7,
                          }}
                        >
                          Lead corporativo · {formatDateTime(createdAt)}
                        </p>
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 20,
                            fontWeight: 300,
                          }}
                        >
                          {quoteNumber} · {customer.companyName}
                        </p>
                      </td>
                    </tr>

                    {/* Highlights de acción */}
                    <tr>
                      <td style={{ padding: "20px 28px 8px" }}>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                        >
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: 4 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                    color: palette.textMuted,
                                  }}
                                >
                                  Total estimado
                                </p>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    fontSize: 28,
                                    fontWeight: 300,
                                    color: palette.text,
                                  }}
                                >
                                  {formatCLP(totalGross)}
                                </p>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    fontSize: 11,
                                    color: palette.textMuted,
                                  }}
                                >
                                  {lines.length}{" "}
                                  {lines.length === 1 ? "línea" : "líneas"} ·{" "}
                                  {totalUnits} unidades · neto{" "}
                                  {formatCLP(subtotalNet)}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Datos de contacto */}
                    <tr>
                      <td style={{ padding: "16px 28px 8px" }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 10,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Contacto
                        </p>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            border: `1px solid ${palette.border}`,
                            backgroundColor: palette.bgMuted,
                          }}
                        >
                          <tbody>
                            <ContactRow label="Empresa" value={customer.companyName} />
                            <ContactRow label="RUT" value={customer.rut} />
                            <ContactRow label="Contacto" value={customer.contactName} />
                            <ContactRow
                              label="Email"
                              value={customer.contactEmail}
                              link={`mailto:${customer.contactEmail}`}
                            />
                            {customer.contactPhone && (
                              <ContactRow
                                label="Teléfono"
                                value={customer.contactPhone}
                                link={`tel:${customer.contactPhone.replace(/\s+/g, "")}`}
                              />
                            )}
                            {occasion && (
                              <ContactRow label="Contexto" value={occasion} />
                            )}
                            {earliestDate && (
                              <ContactRow
                                label="Fecha objetivo + cercana"
                                value={formatDateLong(new Date(earliestDate))}
                                highlight
                              />
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Productos */}
                    <tr>
                      <td style={{ padding: "20px 28px 8px" }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 10,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Productos solicitados
                        </p>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            border: `1px solid ${palette.border}`,
                            borderCollapse: "collapse",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: palette.bgMuted }}>
                              <th
                                align="left"
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 10,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  color: palette.textMuted,
                                  borderBottom: `1px solid ${palette.border}`,
                                  fontWeight: 600,
                                }}
                              >
                                Producto
                              </th>
                              <th
                                align="right"
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 10,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  color: palette.textMuted,
                                  borderBottom: `1px solid ${palette.border}`,
                                  fontWeight: 600,
                                  width: 60,
                                }}
                              >
                                Cant
                              </th>
                              <th
                                align="right"
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 10,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  color: palette.textMuted,
                                  borderBottom: `1px solid ${palette.border}`,
                                  fontWeight: 600,
                                  width: 110,
                                }}
                              >
                                Total bruto
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {lines.map((line) => (
                              <tr key={line.id}>
                                <td
                                  style={{
                                    padding: "12px",
                                    borderBottom: `1px solid ${palette.border}`,
                                    verticalAlign: "top",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: palette.text,
                                    }}
                                  >
                                    {line.productTitle}
                                  </p>
                                  <p
                                    style={{
                                      margin: "4px 0 0",
                                      fontSize: 11,
                                      color: palette.textMuted,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {line.productCategory} · {line.variantTitle}
                                  </p>
                                  <p
                                    style={{
                                      margin: "2px 0 0",
                                      fontSize: 11,
                                      color: palette.textMuted,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {line.techniqueLabel} · {line.areaLabel}
                                  </p>
                                  <p
                                    style={{
                                      margin: "2px 0 0",
                                      fontSize: 11,
                                      color: palette.textMuted,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    Fecha objetivo:{" "}
                                    {formatDateLong(new Date(line.requiredDate))}
                                  </p>
                                </td>
                                <td
                                  align="right"
                                  style={{
                                    padding: "12px",
                                    borderBottom: `1px solid ${palette.border}`,
                                    verticalAlign: "top",
                                    fontSize: 13,
                                    color: palette.text,
                                  }}
                                >
                                  {line.quantity}
                                </td>
                                <td
                                  align="right"
                                  style={{
                                    padding: "12px",
                                    borderBottom: `1px solid ${palette.border}`,
                                    verticalAlign: "top",
                                    fontSize: 13,
                                    color: palette.text,
                                  }}
                                >
                                  {formatCLP(line.pricing.totalGross)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ backgroundColor: palette.bgMuted }}>
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: 11,
                                  color: palette.textMuted,
                                }}
                              >
                                Subtotal neto · IVA {formatCLP(iva)}
                              </td>
                              <td
                                align="right"
                                style={{
                                  padding: "12px",
                                  fontSize: 13,
                                  color: palette.text,
                                }}
                              >
                                {formatCLP(subtotalNet)}
                              </td>
                              <td
                                align="right"
                                style={{
                                  padding: "12px",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: palette.text,
                                }}
                              >
                                {formatCLP(totalGross)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </td>
                    </tr>

                    {/* Notas del cliente */}
                    {notes && (
                      <tr>
                        <td style={{ padding: "16px 28px 8px" }}>
                          <p
                            style={{
                              margin: "0 0 8px",
                              fontSize: 10,
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              color: palette.textMuted,
                            }}
                          >
                            Notas del cliente
                          </p>
                          <p
                            style={{
                              margin: 0,
                              padding: "12px 14px",
                              backgroundColor: palette.highlight,
                              border: `1px solid ${palette.border}`,
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: palette.text,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {notes}
                          </p>
                        </td>
                      </tr>
                    )}

                    {/* Próximo paso */}
                    <tr>
                      <td style={{ padding: "20px 28px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            lineHeight: 1.55,
                            color: palette.text,
                          }}
                        >
                          Responde directamente este mail para contactar a{" "}
                          <strong>{customer.contactName}</strong>. El PDF formal
                          de cotización va adjunto en este mismo correo.
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: "16px 28px",
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
                          Generado automáticamente desde corporativo.bolg.cl
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

function ContactRow({
  label,
  value,
  link,
  highlight,
}: {
  label: string;
  value: string;
  link?: string;
  highlight?: boolean;
}) {
  return (
    <tr>
      <td
        style={{
          padding: "8px 12px",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.textMuted,
          width: 180,
          verticalAlign: "top",
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "8px 12px",
          fontSize: 13,
          color: highlight ? palette.accent : palette.text,
          fontWeight: highlight ? 600 : 400,
          verticalAlign: "top",
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        {link ? (
          <a
            href={link}
            style={{
              color: highlight ? palette.accent : palette.text,
              textDecoration: "none",
            }}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </td>
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
