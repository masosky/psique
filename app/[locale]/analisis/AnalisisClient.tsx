"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  FileText,
  Briefcase,
  Users,
  AlertTriangle,
  HelpCircle,
  Printer,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Copy,
  Check,
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
        primaryColor: "#1d4ed8",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#3b82f6",
        lineColor: "#64748b",
        secondaryColor: "#0f172a",
        tertiaryColor: "#020617",
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
          `<div class="text-muted text-xs p-3 border border-line rounded-lg">Estructura del diagrama</div>`,
        );
      });
  }, [chart]);

  return (
    <div
      className="my-8 flex justify-center overflow-x-auto rounded-lg border border-line bg-card2/40 p-5"
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
    label: "Síntesis Integral",
    icon: FileText,
    desc: "Diagnóstico multidimensional de arquetipo, equilibrio y patrones centrales.",
  },
  {
    id: "work",
    label: "Dinámica Profesional",
    icon: Briefcase,
    desc: "Estilo operativo, toma de decisiones, liderazgo y prevención de fricción.",
  },
  {
    id: "relationships",
    label: "Patrones Relacionales",
    icon: Users,
    desc: "Apego, comunicación afectiva y dinámicas de vinculación.",
  },
  {
    id: "shadow",
    label: "Puntos Ciegos & Riesgos",
    icon: AlertTriangle,
    desc: "Vulnerabilidad al estrés, sesgos cognitivos y zonas de sombra.",
  },
  {
    id: "custom",
    label: "Consulta Psicométrica",
    icon: HelpCircle,
    desc: "Formulación de preguntas específicas sobre tus resultados.",
  },
];

export function AnalisisClient({
  initialReports,
  hasData,
}: {
  initialReports: Report[];
  hasData: boolean;
}) {
  const locale = useLocale();
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialReports[0]?.id || null,
  );
  const [selectedType, setSelectedType] = useState<string>("general");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
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
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al redactar el informe");

      setReports([data.report, ...reports]);
      setSelectedReportId(data.report.id);
      if (selectedType === "custom") setCustomPrompt("");
    } catch (err: any) {
      setError(err.message || "No se pudo generar el informe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar este informe del archivo?")) return;

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

  const handleDownloadPdf = async () => {
    if (!activeReport) return;
    setDownloadingPdf(true);
    try {
      const element = document.getElementById("report-content");
      if (!element) return;
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const opt = {
        margin: 12,
        filename: `psique-${activeReport.type}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0c1424" },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF generation failed, falling back to print:", e);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activeReport) return;
    const blob = new Blob([activeReport.content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psique-${activeReport.type}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!activeReport) return;
    await navigator.clipboard.writeText(activeReport.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!hasData) {
    return (
      <div className="rounded-xl border border-line bg-card p-12 text-center">
        <FileText className="mx-auto mb-4 h-10 w-10 text-muted" />
        <h2 className="font-display text-2xl">Sin datos de evaluación</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Para generar un diagnóstico estructurado, debes completar al menos una de las pruebas
          psicométricas disponibles.
        </p>
        <Link
          href="/tests"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
        >
          Iniciar evaluaciones <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Columna Izquierda: Generador & Archivo */}
      <div className="space-y-6 lg:col-span-4 print:hidden">
        {/* Panel de Configuración de Informe */}
        <div className="rounded-xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              Tipo de Informe
            </h2>
            <span className="font-mono text-[10px] text-muted">PSIQ-DOC</span>
          </div>

          <div className="space-y-2">
            {REPORT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`flex w-full flex-col items-start rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-line/60 bg-card2/30 hover:border-line hover:bg-card2/60"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-medium text-fg">
                      <Icon className="h-3.5 w-3.5 text-accent" />
                      {t.label}
                    </span>
                    {isSelected && (
                      <span className="font-mono text-[10px] text-accent">ACTIVO</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{t.desc}</p>
                </button>
              );
            })}
          </div>

          {selectedType === "custom" && (
            <div className="mt-3 border-t border-line/60 pt-3">
              <label className="mb-1 block font-mono text-[11px] text-muted">
                CONSULTA ESPECÍFICA:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Formula una cuestión sobre tus dimensiones o comportamiento..."
                rows={3}
                className="w-full rounded-md border border-line bg-ink px-3 py-2 text-xs text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {error && <p className="mt-3 text-xs text-bad">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || (selectedType === "custom" && !customPrompt.trim())}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-strong py-2.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {loading ? "Sintetizando informe..." : "Redactar Informe"}
          </button>
        </div>

        {/* Archivo Histórico de Informes */}
        {reports.length > 0 && (
          <div className="rounded-xl border border-line bg-card p-5">
            <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Archivo ({reports.length})
              </h3>
              <span className="font-mono text-[10px] text-muted">HISTORIAL</span>
            </div>
            <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {reports.map((r) => {
                const isSelected = activeReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-line/40 bg-card2/20 hover:border-line hover:bg-card2/40"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-medium text-fg">{r.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted">
                        <Calendar className="h-2.5 w-2.5" />
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
                      title="Eliminar del archivo"
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

      {/* Columna Derecha: Visor de Documento */}
      <div className="lg:col-span-8">
        {activeReport ? (
          <article
            id="report-content"
            className="rounded-xl border border-line bg-card p-8 md:p-10 print:m-0 print:border-none print:bg-transparent print:p-0"
          >
            {/* Cabecera de Documento Clínico / Editorial */}
            <div className="mb-8 border-b border-line pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-accent uppercase tracking-wider border border-accent/30 rounded px-2 py-0.5 bg-accent/5">
                    {activeReport.type}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-good">
                    <ShieldCheck className="h-3.5 w-3.5" /> EVALUADO
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-card2/80 px-3 py-1.5 font-mono text-xs text-fg transition hover:border-accent hover:text-accent disabled:opacity-60"
                    title="Descargar archivo PDF directo"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{downloadingPdf ? "Generando PDF..." : "Descargar PDF"}</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-card2/80 px-3 py-1.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg"
                    title="Descargar archivo Markdown (.md)"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>.MD</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-card2/80 px-3 py-1.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg"
                    title="Copiar texto del informe"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-good" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copiado" : "Copiar"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-card2/60 px-2.5 py-1.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg"
                    title="Abrir menú de impresión del navegador"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="font-display mt-3 text-2xl text-fg md:text-3xl">
                {activeReport.title}
              </h2>

              <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] text-muted">
                <span>DOC_ID: {activeReport.id.slice(0, 10).toUpperCase()}</span>
                <span>•</span>
                <span>
                  FECHA: {new Date(activeReport.createdAt).toLocaleDateString()} -{" "}
                  {new Date(activeReport.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Cuerpo del Informe en Markdown */}
            <div className="prose prose-invert prose-p:text-fg/90 prose-p:leading-relaxed prose-headings:text-fg prose-headings:font-display prose-headings:tracking-tight prose-strong:text-accent prose-hr:border-line prose-li:text-fg/90 max-w-none print:text-black print:prose-p:text-black print:prose-headings:text-black">
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
          <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card/20 p-8 text-center">
            <FileText className="mb-3 h-8 w-8 text-muted" />
            <h3 className="font-display text-base text-fg">Ningún informe seleccionado</h3>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Selecciona una categoría en el panel de configuración para redactar una síntesis
              psicométrica.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
