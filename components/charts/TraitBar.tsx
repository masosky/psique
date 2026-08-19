import { getTrait } from "@/lib/traits";
import { Info } from "lucide-react";

export interface TraitLabels {
  name: string;
  description: string;
  low: string;
  high: string;
}

// Barra de rasgo: para bipolares pinta desde el centro (50) hacia el score;
// para unipolares, desde 0. Marcador puntual + polos + percentil opcional.
// Las etiquetas llegan ya traducidas desde la página (server).
export function TraitBar({
  trait,
  score,
  labels,
  percentile,
  percentileTooltip,
  color,
}: {
  trait: string;
  score: number;
  labels: TraitLabels;
  percentile?: number;
  percentileTooltip?: string;
  color: string;
}) {
  const def = getTrait(trait);
  const s = Math.round(score);
  const fillLeft = def.bipolar ? Math.min(50, s) : 0;
  const fillWidth = def.bipolar ? Math.abs(s - 50) : s;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {labels.name}
          <span
            title={labels.description}
            className="flex cursor-help text-muted hover:text-fg transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="text-xs text-muted">
          {percentile !== undefined && (
            <span
              className="mr-2 rounded-full border border-line px-2 py-0.5"
              title={percentileTooltip}
            >
              P{percentile}
            </span>
          )}
          <span className="font-mono text-fg">{s}</span>
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-card2">
        {def.bipolar && <div className="absolute top-[-2px] left-1/2 h-3 w-px bg-line" />}
        <div
          className="absolute h-2 rounded-full opacity-80"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%`, background: color }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink"
          style={{ left: `${s}%`, background: color }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{labels.low}</span>
        <span>{labels.high}</span>
      </div>
    </div>
  );
}
