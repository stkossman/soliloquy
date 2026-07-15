import type { ChangelogEntry as ChangelogEntryData } from "$lib/changelog/changelog.types";
import { ChangelogEntry } from "../ChangelogEntry";

interface ChangelogPageProps {
  entries: ChangelogEntryData[];
}

export function ChangelogPage({ entries }: ChangelogPageProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-12 space-y-3">
        <a
          href="/"
          className="text-sm font-semibold text-foreground hover:text-muted-foreground"
        >
          Soliloquy
        </a>
        <h1 className="text-3xl font-semibold text-foreground">
          Release notes
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          A record of user-facing changes in Soliloquy.
        </p>
      </header>

      <section aria-label="Release notes">
        {entries.map((entry) => (
          <ChangelogEntry key={entry.version} entry={entry} />
        ))}
      </section>
    </main>
  );
}
