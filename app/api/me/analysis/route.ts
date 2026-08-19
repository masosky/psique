import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getTrait } from "@/lib/traits";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const profile = await loadProfile(session.user.id);
    const measured = Object.keys(profile);

    if (measured.length < 5) {
      return NextResponse.json(
        { error: "Not enough traits measured to generate an analysis" },
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

    const prompt = `
Eres un psicólogo analista experto. Analiza el siguiente perfil de personalidad de un usuario, basado en sus resultados en tests (puntuación de 0 a 100).
El modelo incluye el Big Five, Triada Oscura, Valores, Moralidad, etc.

Puntuaciones:
${profileContext}

Escribe un análisis coherente, profesional y amable dirigido directamente al usuario (hablando de "tú").
Destaca sus principales fortalezas, posibles áreas de conflicto o riesgo, y cómo interactúan sus rasgos entre sí.
El análisis debe estar en el idioma preferido del usuario.

FORMATO REQUERIDO:
- Utiliza **Markdown** enriquecido (encabezados, listas, negritas, etc.) para que sea visualmente atractivo.
- Genera al menos un diagrama analítico usando **Mermaid** (usa el bloque de código \`\`\`mermaid). Por ejemplo, un gráfico circular o radar de sus tendencias principales, o un gráfico de conexiones entre sus rasgos dominantes.
- Usa encabezados Markdown \`##\` o \`###\` para separar secciones.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const analysis = response.text || "";

    if (analysis) {
      // Save it to the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { aiAnalysis: analysis },
      });
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
