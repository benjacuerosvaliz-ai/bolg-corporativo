/**
 * Info detallada de cada técnica de impresión para el modal del configurador.
 *
 * Los `id` deben coincidir con los IDs de las PrintTechniques que vienen de
 * Shopify (ej. "serigrafia-1-color", "bordado", "dtf", "laser"). Si una técnica
 * no está mapeada acá, el modal cae a un texto genérico desde el product data.
 *
 * Cuando Benja pase fotos de muestras reales (mochila bordada, polera con
 * serigrafía, etc.), agregamos `imageUrl` a cada entrada y el modal las
 * mostrará. Por ahora son sólo texto.
 */

export type TechniqueDetail = {
  /** Match con t.id o t.label normalizado del producto. */
  matchKeys: string[];
  /** Título corto del modal. */
  headline: string;
  /** Párrafo descriptivo: qué es y cómo se ve. */
  description: string;
  /** Lista de características concretas. */
  features: string[];
  /** Para qué tipo de logo/diseño funciona mejor. */
  bestFor: string;
  /** Limitaciones honestas. */
  limitations?: string;
  /** URL de foto de muestra real (opcional, completar cuando lleguen assets). */
  imageUrl?: string;
};

export const TECHNIQUE_INFO: readonly TechniqueDetail[] = [
  {
    matchKeys: [
      "serigrafia-1-color",
      "serigrafia",
      "serigrafía",
      "serigrafía 1 color",
    ],
    headline: "Serigrafía 1 color",
    description:
      "Estampa por capas, similar a un sello industrial. Se aplica tinta sólida en una sola tonalidad sobre el producto (mochilas, poleras, bolsos). Tacto firme, durable a lavados y al uso diario. Es la técnica clásica que viste en bolsas de tela de eventos o uniformes.",
    features: [
      "1 sola tinta plana (ej: blanco sobre negro)",
      "Durable: aguanta lavado de máquina y uso intensivo",
      "Costo por unidad bajo en volúmenes grandes",
      "Requiere fotolito (setup fee) que se amortiza con la cantidad",
    ],
    bestFor:
      "Logos simples de 1 color sin degradados ni detalles finos. Por ejemplo un wordmark monocromo o un icono sólido.",
    limitations:
      "No reproduce degradados ni fotos. Si tu logo tiene varios colores, conviene serigrafía full color o DTF.",
  },
  {
    matchKeys: ["serigrafia-full-color", "serigrafía full color", "full color"],
    headline: "Serigrafía full color",
    description:
      "Variante de serigrafía con múltiples capas de tinta para reproducir logos con varios colores. Cada color es una pasada distinta, así que el setup es mayor pero el resultado es premium: colores planos vivos y precisión Pantone.",
    features: [
      "Múltiples colores planos (típicamente 2 a 5)",
      "Excelente fidelidad de color Pantone",
      "Tacto firme y resistente",
      "Setup fee mayor que serigrafía 1 color",
    ],
    bestFor:
      "Logos con 2-5 colores sólidos, sin degradados. Marcas con identidad cromática fuerte.",
    limitations:
      "No reproduce degradados, fotos ni detalles muy finos. Para eso usar DTF.",
  },
  {
    matchKeys: ["bordado", "embroidery"],
    headline: "Bordado",
    description:
      "Aplicación con hilo cosido directo sobre la tela. Es la técnica más premium en percepción: textura tridimensional, brillo del hilo, sensación artesanal. La que verías en gorras o polerones de marcas deportivas premium.",
    features: [
      "Textura 3D real con hilo poliéster o algodón",
      "Mayor durabilidad: no se desgasta como una impresión",
      "Look y feel premium",
      "Setup por digitalización del logo (única vez)",
    ],
    bestFor:
      "Logos compactos sobre mochilas, jockey, polerones. Marcas que comunican calidad/legado.",
    limitations:
      "No funciona bien con detalles finos (texto pequeño <8mm). Tampoco con degradados o fotos. Tarda más que las técnicas planas.",
  },
  {
    matchKeys: ["dtf", "transfer-dtf", "transfer dtf"],
    headline: "Transfer DTF",
    description:
      "Direct-To-Film: imprime tu diseño en una película especial que se transfiere por calor al producto. Permite full color, degradados, fotos y detalles finos. Es la técnica más versátil para diseños complejos.",
    features: [
      "Reproduce cualquier color, degradados, fotos",
      "Detalles finos perfectos (incluso texto chico)",
      "Sin setup fee de fotolito",
      "Resistente al lavado",
    ],
    bestFor:
      "Logos full color con degradados, ilustraciones, fotos, diseños complejos. Cuando la fidelidad visual importa más que la textura.",
    limitations:
      "Tacto más plástico que serigrafía (se siente la película). En zonas muy grandes, el tacto es notorio.",
  },
  {
    matchKeys: ["laser", "grabado-laser", "grabado láser"],
    headline: "Grabado láser",
    description:
      "Quema controlada del material para dejar el logo grabado en relieve (sin tinta). Se usa sobre cuero, madera, metal o productos duros. Es elegante, permanente y muy premium en percepción.",
    features: [
      "Permanente — no se borra ni con lavado",
      "Sin tinta: el grabado es el material mismo",
      "Look minimalista premium",
      "Ideal para billeteras, llaveros, botellas metálicas",
    ],
    bestFor:
      "Productos rígidos: cuero (billeteras), madera, metal (botellas, llaveros). Logos minimalistas, wordmarks, monogramas.",
    limitations:
      "Solo en materiales rígidos compatibles. No funciona en tela suave (mochilas, poleras). Es monocromo por naturaleza (el color del material grabado).",
  },
] as const;

/**
 * Busca info detallada de una técnica por id o label.
 * Si no hay match, devuelve null y el modal cae a la descripción del product.
 */
export function findTechniqueDetail(
  idOrLabel: string,
): TechniqueDetail | null {
  const normalized = idOrLabel.toLowerCase().trim();
  for (const detail of TECHNIQUE_INFO) {
    if (detail.matchKeys.some((k) => k.toLowerCase() === normalized)) {
      return detail;
    }
  }
  return null;
}
