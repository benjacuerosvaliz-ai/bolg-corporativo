/* eslint-disable @next/next/no-head-element -- HTML email, no es una página Next */

/**
 * Email interno al equipo BØLG cuando alguien envía el formulario de contacto.
 *
 * Similar a QuoteToSales pero más simple: sin tabla de productos, sin
 * adjuntos. Lo importante es el mensaje libre del usuario + sus datos de
 * contacto destacados para responderle en un click.
 */

export type ContactInquiryProps = {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  submittedAt: Date;
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

export function ContactInquiry({
  name,
  email,
  company,
  phone,
  message,
  submittedAt,
}: ContactInquiryProps) {
  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nuevo contacto: {name}</title>
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
                          Formulario de contacto · {formatDateTime(submittedAt)}
                        </p>
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 20,
                            fontWeight: 300,
                          }}
                        >
                          {name}
                          {company ? ` · ${company}` : ""}
                        </p>
                      </td>
                    </tr>

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
                            <Row label="Nombre" value={name} />
                            <Row
                              label="Email"
                              value={email}
                              link={`mailto:${email}`}
                            />
                            {company && <Row label="Empresa" value={company} />}
                            {phone && (
                              <Row
                                label="Teléfono"
                                value={phone}
                                link={`tel:${phone.replace(/\s+/g, "")}`}
                              />
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "20px 28px" }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 10,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: palette.textMuted,
                          }}
                        >
                          Mensaje
                        </p>
                        <p
                          style={{
                            margin: 0,
                            padding: "16px 18px",
                            backgroundColor: palette.bgMuted,
                            border: `1px solid ${palette.border}`,
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: palette.text,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {message}
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "12px 28px 20px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            lineHeight: 1.55,
                            color: palette.text,
                          }}
                        >
                          Responde directamente este mail para contactar a{" "}
                          <strong>{name}</strong>.
                        </p>
                      </td>
                    </tr>

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
                          Generado desde corporativo.bolg.cl/contacto
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

function Row({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
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
          width: 110,
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
          color: palette.text,
          verticalAlign: "top",
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        {link ? (
          <a
            href={link}
            style={{ color: palette.accent, textDecoration: "none" }}
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
