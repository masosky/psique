import type { TestSource } from "@/lib/tests";

// «De dónde sale esto»: las referencias del instrumento en el que se basa el
// test. Es la diferencia entre un test y un horóscopo, así que se muestra
// tanto en el catálogo como al terminar.
export function TestSources({
  sources,
  title,
  intro,
  notes,
}: {
  sources: TestSource[];
  title: string;
  intro: string;
  notes: string[];
}) {
  return (
    <section className="rounded-xl border border-line bg-card p-6">
      <h3 className="font-display mb-1 text-lg">{title}</h3>
      <p className="mb-5 text-xs text-muted">{intro}</p>
      <ol className="space-y-3">
        {sources.map((s, i) => (
          <li key={s.url} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-muted">[{i + 1}]</span>
            <div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                {s.citation}
              </a>
              <p className="mt-0.5 text-xs text-muted">{notes[i]}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
