import type { TraitCategory } from "@/lib/traits";

// Un ítem tipo Likert (1 = muy en desacuerdo … 5 = muy de acuerdo).
// `loadings` indica sobre qué rasgos puntúa y en qué dirección:
//   +1 → estar de acuerdo sube el rasgo; -1 → ítem invertido.
// El enunciado vive en messages/{locale}.json → `tests.<slug>.items.<id>`.
export interface TestItem {
  id: string;
  loadings: Record<string, 1 | -1>;
}

// Referencia al instrumento o estudio del que sale el test. Se muestra en la
// ficha del test: sin esto, «test de personalidad» suena a horóscopo.
export interface TestSource {
  // Cita corta: "Goldberg (1992). IPIP Big-Five markers"
  citation: string;
  // Enlace estable: DOI preferido, si no la página del instrumento.
  url: string;
  // Qué aporta esta fuente al test: "estructura de los 5 factores",
  // "banco de ítems de dominio público"… Traducido en messages →
  // `tests.<slug>.sources.<index>`.
  noteKey: string;
}

// Título, tagline y descripción viven en messages → `tests.<slug>.*`.
export interface TestDefinition {
  slug: string;
  version: number;
  emoji: string;
  category: TraitCategory;
  traits: string[]; // rasgos que mide (ids de lib/traits.ts)
  minutes: number; // duración estimada
  sources: TestSource[];
  items: TestItem[];
}
