"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  Briefcase,
  Heart,
  EyeOff,
  MessageSquare,
  Printer,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

function MermaidBlock({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        fontFamily: "inherit",
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#1d4ed8",
        lineColor: "#60a5fa",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
      },
    });

    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid
      .render(id, chart)
      .then((result) => {
        setSvg(result.svg);
      })
      .catch((e) => {
        console.error("Mermaid error:", e);
        setSvg(
          `<div class="text-bad text-xs p-3 border border-bad/30 rounded-lg">Diagrama en proceso de renderizado</div>`,
        );
      });
  }, [chart]);

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto rounded-xl border border-line/60 bg-card/60 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface Report {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: Date | string;
}

const REPORT_TYPES = [
  {
    id: "general",
    label: "Integral",
    icon: Sparkles,
    desc: "Diagnóstico global, fortalezas principales y equilibrio general.",
    color: "text-accent",
  },
  {
    id: "work",
    label: "Profesional",
    icon: Briefcase,
    desc: "Estilo de trabajo, liderazgo, entornos ideales y productividad.",
    color: "text-good",
  },
  {
    id: "relationships",
    label: "Relaciones",
    icon: Heart,
    desc: "Apego, dinámicas de pareja, comunicación y patrones afectivos.",
    color: "text-pink-400",
  },
  {
    id: "shadow",
    label: "Puntos Ciegos",
    icon: EyeOff,
    desc: "Reacción bajo estrés, sesgos inconscientes y riesgos psicológicos.",
    color: "text-warn",
  },
  {
    id: "custom",
    label: "Consulta Libre",
    icon: MessageSquare,
    desc: "Haz una pregunta libre o pide un consejo personalizado a la IA.",
    color: "text-sky-400",
  },
];

export function AnalisisClient({
  initialReports,
  hasData,
}: {
  initialReports: Report[];
  hasData: boolean;
}) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialReports[0]?.id || null,
  );
  const [selectedType, setSelectedType] = useState<string>("general");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0] || null;

  const handleGenerate = async () => {
    if (!hasData) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/me/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          customPrompt: selectedType === "custom" ? customPrompt : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar el informe");

      setReports([data.report, ...reports]);
      setSelectedReportId(data.report.id);
      if (selectedType === "custom") setCustomPrompt("");
    } catch (err: any) {
      setError(err.message || "No se pudo generar el informe. Revisa tu clave de Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar este reporte?")) return;

    try {
      await fetch(`/api/me/reports/${id}`, { method: "DELETE" });
      const nextReports = reports.filter((r) => r.id !== id);
      setReports(nextReports);
      if (selectedReportId === id) {
        setSelectedReportId(nextReports[0]?.id || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-line bg-card p-12 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted" />
        <h2 className="font-display text-2xl">Aún no tienes tests completados</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Para que el psicólogo de IA pueda analizar tu personalidad y relaciones, completa al menos
          1 test en la plataforma.
        </p>
        <Link
          href="/tests"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
        >
          Ir a los tests <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Columna Izquierda: Generador & Historial */}
      <div className="space-y-6 lg:col-span-4 print:hidden">
        {/* Generador de Nuevos Reportes */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="font-display mb-3 flex items-center gap-2 text-base text-fg">
            <Layers className="h-4 w-4 text-accent" />
            Nuevo Análisis
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {REPORT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-line bg-card2/50 hover:border-line/80 hover:bg-card2"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-fg">
                      <Icon className={`h-4 w-4 ${t.color}`} />
                      {t.label}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{t.desc}</p>
                </button>
              );
            })}
          </div>

          {selectedType === "custom" && (
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-muted">
                Tu pregunta o tema:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ej: ¿Por qué me cuesta tanto tomar decisiones bajo presión?"
                rows={3}
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {error && <p className="mt-3 text-xs text-bad">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || (selectedType === "custom" && !customPrompt.trim())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-strong py-2.5 text-sm font-medium text-white transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Analizando perfil..." : "Generar Análisis"}
          </button>
        </div>

        {/* Historial de Reportes */}
        {reports.length > 0 && (
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h3 className="font-display mb-3 text-sm tracking-wide text-muted uppercase">
              Historial ({reports.length})
            </h3>
            <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {reports.map((r) => {
                const isSelected = activeReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-accent/80 bg-accent/10"
                        : "border-line/60 bg-card2/40 hover:bg-card2"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-medium text-fg">{r.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.createdAt).toLocaleDateString()} ·{" "}
                        {new Date(r.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(r.id, e)}
                      className="opacity-0 transition group-hover:opacity-100 hover:text-bad p-1"
                      title="Eliminar reporte"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Columna Derecha: Vista del Reporte Activo */}
      <div className="lg:col-span-8">
        {activeReport ? (
          <article className="rounded-2xl border border-line bg-card p-8 shadow-sm print:m-0 print:border-none print:bg-transparent print:p-0 print:shadow-none">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent uppercase">
                  {activeReport.type}
                </span>
                <h2 className="font-display mt-2 text-2xl text-fg">{activeReport.title}</h2>
                <p className="mt-1 text-xs text-muted">
                  Generado el {new Date(activeReport.createdAt).toLocaleDateString()} a las{" "}
                  {new Date(activeReport.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg border border-line bg-card2 px-4 py-2 text-xs font-medium text-muted transition hover:border-accent hover:text-fg print:hidden"
                title="Descargar o Imprimir en PDF"
              >
                <Printer className="h-4 w-4" />
                <span>Exportar PDF</span>
              </button>
            </div>

            {/* Contenido Markdown con Tipografía de Alto Contraste */}
            <div className="prose prose-invert prose-p:text-fg/90 prose-p:leading-relaxed prose-headings:text-fg prose-headings:font-display prose-strong:text-accent prose-hr:border-line/70 prose-li:text-fg/90 max-w-none print:text-black print:prose-p:text-black print:prose-headings:text-black">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    if (match && match[1] === "mermaid") {
                      return <MermaidBlock chart={String(children).replace(/\n$/, "")} />;
                    }
                    return (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {activeReport.content}
              </ReactMarkdown>
            </div>
          </article>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/40 p-8 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-muted" />
            <h3 className="font-display text-lg text-fg">Ningún análisis seleccionado</h3>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Elige un tipo de reporte en el panel lateral y pulsa en &quot;Generar Análisis&quot;
              para iniciar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
