"use client";

import { useState, useRef } from "react";
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Smartphone,
  Square,
  Sparkles,
} from "lucide-react";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";

interface ShareCardProps {
  userName: string | null;
  archetype: string | null;
  archetypeDesc?: string | null;
  dominantTrait?: { name: string; score: number; percentile?: number } | null;
  topTraits: Array<{ name: string; score: number; percentile?: number }>;
  measuredCount: number;
}

export function ShareCardModal({
  userName,
  archetype,
  archetypeDesc,
  dominantTrait,
  topTraits,
  measuredCount,
}: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"card" | "story">("card");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#070d19",
        logging: false,
      });

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `psique-${format}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (err) {
      console.error("Error generating card image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#070d19",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (e) {
          console.error("Clipboard copy failed", e);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#070d19",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "psique-perfil.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Mi Perfil Psicométrico en Psique: ${archetype}`,
            text: `Descubre tu perfil psicológico y arquetipo en https://psique.blueberrybytes.com`,
            files: [file],
          });
          setShared(true);
          setTimeout(() => setShared(false), 2500);
        } else {
          // Fallback to clipboard copy
          handleCopyImage();
        }
      });
    } catch (e) {
      console.error("Native share failed", e);
    }
  };

  const tweetText = `Mi perfil psicométrico en @BlueberryBytes: ${archetype || "Evaluación completa"}. Descubre el tuyo en`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText,
  )}&url=${encodeURIComponent("https://psique.blueberrybytes.com")}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-line bg-card2/70 px-4 py-2 text-xs font-medium text-fg transition hover:border-accent hover:text-accent shadow-sm"
        title="Generar tarjeta para Twitter / Instagram"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Compartir en X / IG</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-line bg-ink p-6 shadow-2xl">
            {/* Header del Modal */}
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-lg text-fg">Carta Psicométrica</h3>
                <p className="text-xs text-muted">
                  Optimizado para Instagram Stories, Twitter (X) y LinkedIn.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-card hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selector de Formato (Post vs Story) */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setFormat("card")}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${
                  format === "card"
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-line bg-card text-muted hover:text-fg"
                }`}
              >
                <Square className="h-3.5 w-3.5" />
                <span>Formato Tarjeta / Post</span>
              </button>

              <button
                onClick={() => setFormat("story")}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${
                  format === "story"
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-line bg-card text-muted hover:text-fg"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Formato Story (9:16)</span>
              </button>
            </div>

            {/* Contenedor de la Tarjeta Gráfica */}
            <div className="flex justify-center py-2">
              <div
                ref={cardRef}
                className={`relative w-full overflow-hidden border border-line/80 bg-gradient-to-b from-[#0c1424] via-[#080e1a] to-[#050912] text-fg shadow-2xl transition-all ${
                  format === "story"
                    ? "max-w-[340px] aspect-[9/16] p-7 rounded-3xl flex flex-col justify-between"
                    : "max-w-[380px] p-6 rounded-2xl"
                }`}
              >
                {/* Marca de agua Rorschach de fondo */}
                <svg
                  viewBox={MARK.viewBox}
                  className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 fill-accent/5"
                  aria-hidden
                >
                  {MARK.wings.map((d) => (
                    <path key={d} d={d} />
                  ))}
                  <ellipse
                    cx={MARK.body.cx}
                    cy={MARK.body.cy}
                    rx={MARK.body.rx}
                    ry={MARK.body.ry}
                  />
                </svg>

                {/* Cabecera de la Tarjeta */}
                <div>
                  <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-3">
                    <div className="flex items-center gap-2">
                      <svg viewBox={MARK.viewBox} className="h-5 w-5 fill-accent" aria-hidden>
                        {MARK.wings.map((d) => (
                          <path key={d} d={d} />
                        ))}
                        <ellipse
                          cx={MARK.body.cx}
                          cy={MARK.body.cy}
                          rx={MARK.body.rx}
                          ry={MARK.body.ry}
                        />
                      </svg>
                      <span className="font-display text-base font-semibold tracking-tight text-accent">
                        {BRAND_WORDMARK}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                      {userName || "PERFIL EVALUADO"}
                    </span>
                  </div>

                  {/* Arquetipo Principal */}
                  <div className="mb-6">
                    <p className="font-mono text-[10px] font-semibold text-accent uppercase tracking-widest">
                      ARQUETIPO DOMINANTE
                    </p>
                    <h4 className="font-display mt-1.5 text-2xl font-bold leading-tight text-fg">
                      {archetype || "Perfil Analítico"}
                    </h4>
                    {archetypeDesc && (
                      <p className="mt-2 text-xs text-muted/90 leading-relaxed line-clamp-3">
                        {archetypeDesc}
                      </p>
                    )}
                  </div>

                  {/* Rasgo más distintivo / Rareza */}
                  {dominantTrait && (
                    <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-accent">
                          {dominantTrait.name}
                        </span>
                        {dominantTrait.percentile !== undefined && (
                          <span className="font-mono text-xs font-bold text-good">
                            P{dominantTrait.percentile} (Top {100 - dominantTrait.percentile}%)
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-card2">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${dominantTrait.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Top Rasgos Clave */}
                  <div className="space-y-3 mb-6">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-wider">
                      CONFIGURACIÓN DE RASGOS ({measuredCount} DIMENSIONES)
                    </p>
                    {topTraits.slice(0, format === "story" ? 5 : 4).map((t) => (
                      <div key={t.name}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-fg/90 font-medium">{t.name}</span>
                          <span className="font-mono text-[11px] text-muted">
                            {Math.round(t.score)}/100
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-card2/80">
                          <div
                            className="h-1.5 rounded-full bg-accent/70"
                            style={{ width: `${t.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer con referencia oficial */}
                <div className="flex items-center justify-between border-t border-line/60 pt-4 text-[10px] text-muted">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-good" />
                    <span>psique.blueberrybytes.com</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://blueberrybytes.com/bbb.svg"
                      alt="Blueberry Bytes"
                      className="h-3.5 w-3.5 rounded-sm object-contain"
                    />
                    <span>Blueberry Bytes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint para Instagram */}
            <p className="mt-2 text-center text-[11px] text-muted">
              💡 <strong>Tip para Instagram Stories:</strong> Pulsa en{" "}
              <em>&quot;Copiar Imagen&quot;</em> y pégala directamente en tu historia de IG, o
              descárgala en PNG.
            </p>

            {/* Barra de Acciones */}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                {/* SVG Oficial de X / Twitter */}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>

              {typeof navigator !== "undefined" && "canShare" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-medium text-fg transition hover:border-accent hover:text-accent"
                  title="Compartir en Instagram u otras aplicaciones"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{shared ? "¡Compartido!" : "Compartir en Apps"}</span>
                </button>
              )}

              <button
                onClick={handleCopyImage}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-good" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "¡Imagen Copiada!" : "Copiar Imagen"}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-xs font-medium text-white transition hover:bg-accent disabled:opacity-60"
              >
                {downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>{downloading ? "Generando..." : "Descargar PNG"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
