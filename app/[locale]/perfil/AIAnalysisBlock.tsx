"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Printer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

function MermaidBlock({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        fontFamily: "inherit",
      },
    });

    // Generamos un ID único para evitar colisiones
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    mermaid
      .render(id, chart)
      .then((result) => {
        setSvg(result.svg);
      })
      .catch((e) => {
        console.error("Mermaid render error", e);
        setSvg(
          `<div class="text-bad text-sm p-4 border border-bad/30 rounded-lg">Error renderizando diagrama</div>`,
        );
      });
  }, [chart]);

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function AIAnalysisBlock({
  initialAnalysis,
  canGenerate,
  labels,
}: {
  initialAnalysis: string | null;
  canGenerate: boolean;
  labels: {
    title: string;
    subtitle: string;
    generateBtn: string;
    generating: string;
    errorText: string;
    notEnoughData: string;
    readMore: string;
    readLess: string;
  };
}) {
  const [analysis, setAnalysis] = useState<string | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/analysis", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setAnalysis(data.analysis);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message || labels.errorText);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Para asegurar que todo se vea bien, expandimos si estaba colapsado
    setExpanded(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const hasAnalysis = !!analysis;
  // If it's a long analysis, we can collapse it
  const isLong = analysis && analysis.length > 800;
  const shouldTruncate = isLong && !expanded;

  return (
    <section className="mb-10 rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-sm print:m-0 print:border-none print:bg-transparent print:p-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl text-accent">
            <Sparkles className="h-5 w-5" />
            {labels.title}
          </h2>
          {!hasAnalysis && <p className="mt-1 text-sm text-muted">{labels.subtitle}</p>}
        </div>

        <div className="flex gap-2">
          {hasAnalysis && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
              title="Descargar PDF (Imprimir)"
            >
              <Printer className="h-4 w-4" />
            </button>
          )}

          {!hasAnalysis && canGenerate && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition hover:bg-accent disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? labels.generating : labels.generateBtn}
            </button>
          )}
        </div>
      </div>

      {/* Titulo para impresión */}
      <h2 className="font-display hidden text-2xl mb-4 print:block">{labels.title}</h2>

      {!canGenerate && !hasAnalysis && (
        <p className="mt-3 text-sm text-muted italic print:hidden">{labels.notEnoughData}</p>
      )}

      {error && <p className="mt-3 text-sm text-bad print:hidden">{error}</p>}

      {hasAnalysis && (
        <div className="mt-5 text-sm leading-relaxed text-fg/90">
          <div
            className={`relative ${shouldTruncate ? "max-h-[300px] overflow-hidden" : ""}`}
            style={{
              WebkitMaskImage: shouldTruncate
                ? "linear-gradient(to bottom, black 50%, transparent 100%)"
                : "none",
            }}
          >
            <div className="prose prose-invert prose-p:text-fg/90 prose-p:leading-relaxed prose-headings:text-fg prose-strong:text-accent prose-hr:border-line max-w-none print:text-black print:prose-p:text-black">
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
                {analysis}
              </ReactMarkdown>
            </div>
          </div>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-xs font-medium text-accent hover:underline print:hidden"
            >
              {expanded ? (
                <>
                  {labels.readLess} <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  {labels.readMore} <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
