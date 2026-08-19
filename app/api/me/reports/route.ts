import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getTrait } from "@/lib/traits";

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
    const reportType = body.type || "general";
    const customPrompt = body.customPrompt || "";

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

    // Build the prompt context
    const profileContext = measured
      .map((t) => {
        const def = getTrait(t);
        return `- ${t} (${def.category}): ${profile[t]}/100`;
      })
      .join("\n");

    let systemInstructions = "";
    let title = "Análisis General";

    switch (reportType) {
      case "work":
        title = "Perfil Profesional & Liderazgo";
        systemInstructions = `
Enfócate exclusivamente en el ámbito LABORAL, PROFESIONAL y de CARRERA:
- Estilo de trabajo, productividad y toma de decisiones.
- Dinámica en equipo y estilo de liderazgo o colaboración.
- Entornos laborales óptimos y posibles puntos de fricción o agotamiento (burnout).
- Un diagrama Mermaid que resuma sus competencias clave en el trabajo.
        `;
        break;
      case "relationships":
        title = "Relaciones, Pareja & Apego";
        systemInstructions = `
Enfócate exclusivamente en las RELACIONES INTERPERSONALES, AFECTIVAS y DE PAREJA:
- Estilo de apego, comunicación emocional y resolución de conflictos.
- Qué necesita en una pareja/amigo y qué suele aportar.
- Puntos ciegos relacionales y patrones recurrentes.
- Un diagrama Mermaid que ilustre su dinámica relacional.
        `;
        break;
      case "shadow":
        title = "Puntos Ciegos, Estrés & Sombra";
        systemInstructions = `
Enfócate con honestidad constructiva en la "SOMBRA", PUNTOS CIEGOS y RESPUESTA AL ESTRÉS:
- Rasgos de riesgo (tríada oscura, neuroticismo, complacencia o rigidez).
- Cómo reacciona bajo presión y qué trampas mentales suele sufrir.
- Estrategias prácticas y recomendaciones psicológicas de crecimiento personal.
- Un diagrama Mermaid de sus principales desencadenantes de estrés o alertas.
        `;
        break;
      case "custom":
        title = customPrompt
          ? `Consulta: ${customPrompt.slice(0, 35)}...`
          : "Consulta con el Psicólogo IA";
        systemInstructions = `
El usuario tiene la siguiente pregunta específica sobre su perfil o personalidad:
"${customPrompt}"

Responde con rigor psicológico, cercanía y profundidad basándote estrictamente en sus puntuaciones registradas. Si aplica, añade un diagrama Mermaid explicativo.
        `;
        break;
      case "general":
      default:
        title = "Análisis Integral de Personalidad";
        systemInstructions = `
Haz un análisis global, coherente y profundo del perfil completo:
- Arquetipo global dominante y combinación única de rasgos.
- Principales fortalezas y ventajas cognitivas/emocionales.
- Áreas de tensión o paradojas interesantes entre sus rasgos.
- Un diagrama Mermaid que visualice el equilibrio de sus dimensiones clave.
        `;
        break;
    }

    const fullPrompt = `
Eres un psicólogo analista clínico y experto en psicometría.
Analiza el siguiente perfil de personalidad de un usuario (escalas de 0 a 100):

PUNTUACIONES REGISTRADAS:
${profileContext}

OBJETIVO DEL REPORTE:
${systemInstructions}

REGLAS DE FORMATO Y ESTILO:
- Habla directamente al usuario de "tú", con tono profesional, empático y perspicaz.
- Utiliza **Markdown** rico (títulos ##, listas, negritas, separadores) para estructurar el contenido de manera impecable.
- Incluye al menos un bloque de código \`\`\`mermaid\`\`\` bien formateado con un gráfico o mapa de conceptos.
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
    console.error("AI report error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
