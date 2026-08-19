import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getTrait } from "@/lib/traits";

const LOCALE_NAMES: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ca: "Catalan",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
};

const REPORT_TITLES: Record<string, Record<string, string>> = {
  general: {
    es: "Síntesis Integral de Personalidad",
    en: "Comprehensive Personality Synthesis",
    ca: "Síntesi Integral de Personalitat",
    de: "Umfassende Persönlichkeitssynthese",
    fr: "Synthèse Globale de Personnalité",
    it: "Sintesi Globale della Personalità",
    pt: "Síntese Integral de Personalidade",
    ru: "Комплексный анализ личности",
  },
  work: {
    es: "Dinámica Profesional & Liderazgo",
    en: "Professional Dynamics & Leadership",
    ca: "Dinàmica Professional i Lideratge",
    de: "Berufliche Dynamik & Führung",
    fr: "Dynamique Professionnelle & Leadership",
    it: "Dinamica Professionale & Leadership",
    pt: "Dinâmica Profissional & Liderança",
    ru: "Профессиональная динамика и лидерство",
  },
  relationships: {
    es: "Patrones Relacionales & Apego",
    en: "Relational Patterns & Attachment",
    ca: "Patrons Relacionals i Vincle",
    de: "Beziehungsmuster & Bindung",
    fr: "Modèles Relationnels & Attachement",
    it: "Modelli Relazionali & Attaccamento",
    pt: "Padrões Relacionais & Apego",
    ru: "Паттерны отношений и привязанность",
  },
  shadow: {
    es: "Puntos Ciegos, Estrés & Sombra",
    en: "Blind Spots, Stress & Shadow",
    ca: "Punts Cecs, Estrès i Ombra",
    de: "Blinde Flecken, Stress & Schatten",
    fr: "Angles Morts, Stress & Ombre",
    it: "Punti Ciechi, Stress & Ombra",
    pt: "Pontos Cegos, Estresse & Sombra",
    ru: "Слепые зоны, стресс и тень",
  },
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.aiReport.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reportType: string = body.type || "general";
    const customPrompt: string = body.customPrompt || "";
    const locale: string = body.locale || "es";
    const languageName = LOCALE_NAMES[locale] || "Spanish";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const profile = await loadProfile(session.user.id);
    const measured = Object.keys(profile);

    if (measured.length === 0) {
      return NextResponse.json(
        { error: "No traits measured yet to generate an analysis" },
        { status: 400 },
      );
    }

    // Build context vector of measured traits
    const profileContext = measured
      .map((t) => {
        const def = getTrait(t);
        return `- ${t} (${def.category}): ${profile[t]}/100`;
      })
      .join("\n");

    let reportFocusInstructions = "";
    let title =
      REPORT_TITLES[reportType]?.[locale] || REPORT_TITLES[reportType]?.en || "Psychometric Report";

    switch (reportType) {
      case "work":
        reportFocusInstructions = `
Focus strictly on the OCCUPATIONAL, WORKPLACE, and CAREER dimensions:
- Operating work style, task execution, strategic decision making, and problem solving.
- Team dynamics, collaboration style, and leadership approach.
- Ideal working environments, risk of friction, and burnout vulnerabilities.
- A clean Mermaid flowchart/diagram summarizing core workplace competencies and strengths.
        `;
        break;
      case "relationships":
        reportFocusInstructions = `
Focus strictly on INTERPERSONAL, AFFECTIVE, and RELATIONAL dynamics:
- Attachment orientation, emotional communication style, and conflict handling.
- Relational needs, interpersonal contributions, and mutual expectations.
- Recurrent relational blind spots, vulnerability patterns, and intimacy boundaries.
- A clean Mermaid diagram illustrating the user's relational dynamic.
        `;
        break;
      case "shadow":
        reportFocusInstructions = `
Focus with constructive clinical rigor on the PSYCHOLOGICAL SHADOW, BLIND SPOTS, and STRESS DYNAMICS:
- Risk traits (dark triad tendencies, neurotic vulnerabilities, excessive compliance, or defensive rigidity).
- Behavioral reactions under acute pressure, cognitive biases, and self-sabotaging traps.
- Grounded, actionable growth strategies for psychological integration.
- A clean Mermaid diagram outlining primary stress triggers and counter-measures.
        `;
        break;
      case "custom":
        title = customPrompt ? `${customPrompt.slice(0, 35)}...` : "Psychometric Inquiry";
        reportFocusInstructions = `
The user has submitted the following specific inquiry regarding their personality profile:
"${customPrompt}"

Provide a deep, rigorous, and personalized clinical-psychometric answer based strictly on their measured traits. Include a relevant Mermaid diagram if it enhances conceptual clarity.
        `;
        break;
      case "general":
      default:
        reportFocusInstructions = `
Provide an integrated, comprehensive psychometric synthesis of the complete profile:
- Dominant global archetype and unique configuration of core dimensions.
- Primary operational strengths, cognitive agility, and emotional resources.
- Tensions, dualities, or paradoxical interactions between traits.
- A clean Mermaid diagram visualizing the equilibrium across key dimensions.
        `;
        break;
    }

    const fullPrompt = `
You are the psychometric synthesis engine for Psique. You produce rigorous, analytical, publication-quality psychological reports grounded in empirical psychometrics (Big Five, HEXACO, Dark Triad, Moral Foundations, Schwartz Values).

EVALUATED PROFILE DATA (Scores 0 to 100):
${profileContext}

REPORT SCOPE:
${reportFocusInstructions}

STYLE AND FORMAT RULES:
- STRICT LANGUAGE REQUIREMENT: You MUST write the entire report in ${languageName} (${locale}).
- NO CHATBOT FILLER: NEVER start with conversational openings (NO "Hello", "Welcome", "As an analyst...", "I am happy to...").
- Begin DIRECTLY with the top-level Markdown title: # Title
- Tone: Clinical, objective, articulate, mature, and deeply perceptive. Address the subject directly using second person ("you" / "tú" / "vous" / "du", etc.).
- Formatting: Use structured Markdown (## Section titles, ordered/unordered lists, bolded concepts).
- NO ASCII BOXES: NEVER generate ASCII art, plain text box drawings, or pseudo-code boxes. Use standard Markdown tables (| Col | Col |) or Mermaid diagrams instead.
- Include at least one valid, clean \`\`\`mermaid\`\`\` code block diagram synthesizing the trait map or relational flow.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
    });

    const analysisText = response.text || "";

    if (!analysisText) {
      return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
    }

    const report = await prisma.aiReport.create({
      data: {
        userId: session.user.id,
        type: reportType,
        title,
        content: analysisText,
      },
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("AI report generation error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
