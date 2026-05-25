/**
 * Design tokens de la marca BOLG.
 *
 * Fuente: theme export oficial de www.bolg.cl (Impulse v7.6.2),
 * extraído de config/settings_data.json + snippets/css-variables.liquid.
 *
 * Tono: monocromático negro/blanco, minimal. Burgundy #682d2d solo como
 * acento (originalmente del checkout). Rojo solo para ofertas/savings.
 */
export const bolgTokens = {
  colors: {
    body: { bg: "#ffffff", text: "#000000" },
    button: { bg: "#111111", text: "#ffffff" },
    border: "#e8e8e1",
    price: "#1c1d1d",
    savings: "#ff4e4e",
    saleTag: { bg: "#f40909", text: "#ffffff" },
    cartDot: "#ff4f33",
    smallImageBg: "#e5e5e5",
    largeImageBg: "#0f0f0f",
    header: { bg: "#ffffff", text: "#000000" },
    announcement: { bg: "#0f0f0f", text: "#ffffff" },
    footer: { bg: "#ffffff", text: "#000000" },
    drawer: {
      bg: "#ffffff",
      text: "#000000",
      border: "#e8e8e1",
      button: "#111111",
      buttonText: "#ffffff",
    },
    modalOverlay: "#e6e6e6",
    imageOverlay: "#000000",
    /** Burgundy de checkout. Único acento cromático en toda la marca. */
    accent: "#682d2d",
    error: "#ff6d6d",
  },
  typography: {
    heading: {
      family: "Mona Sans",
      weight: 300,
      baseSizePx: 22,
      lineHeight: 1,
      letterSpacingEm: 0.025,
      uppercase: true,
    },
    body: {
      family: "Basic Commercial",
      fallbackFamily: "Inter",
      weight: 400,
      baseSizePx: 16,
      lineHeight: 1.6,
      letterSpacingEm: 0.025,
    },
    navigation: { sizePx: 12, uppercase: false },
    collection: { sizePx: 24 },
  },
  radii: {
    /** button_style: round-slight → 3px */
    button: "3px",
    card: "0px",
    input: "3px",
  },
  spacing: {
    gridGutterPx: 17,
    drawerGutterPx: 20,
  },
  icon: {
    weightPx: 3,
    linecap: "miter" as const,
  },
  social: {
    instagram: "https://www.instagram.com/bolg.cl/",
    tiktok: "https://www.tiktok.com/@bolg.cl",
    linkedin: "https://www.linkedin.com/company/bolgconcept",
    youtube: "https://www.youtube.com/@BolgConcept",
  },
} as const;

export type BolgTokens = typeof bolgTokens;
