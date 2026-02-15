import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchLeaderboard,
  groupLeaderboard,
  resolveDocLink,
  TYPE_CONFIG,
} from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/lib/schemas/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard | Ryder.AI",
  description:
    "Personal ranked registry of tools, skills, models, and workflows from AI documentation",
};

const typeColors: Record<string, string> = {
  tool: "#00E5CC",
  skill: "#FFB347",
  model: "#8B5CF6",
  application: "#F472B6",
  workflow: "#38BDF8",
};

function StatusBadge({ status }: { status: "used" | "researched" }) {
  if (status === "used") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill border border-complete/20 bg-complete/10 px-2.5 py-0.5 text-xs font-medium text-complete">
        <span aria-hidden="true">🟢</span>
        Used
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-2.5 py-0.5 text-xs font-medium text-[#3B82F6]">
      <span aria-hidden="true">🔵</span>
      Researched
    </span>
  );
}

function EntryName({ entry }: { entry: LeaderboardEntry }) {
  const href = entry.doc_link ? resolveDocLink(entry.doc_link) : null;

  if (href) {
    return (
      <Link
        href={href}
        className="font-medium text-primary underline decoration-white/20 underline-offset-2 transition-colors hover:text-teal hover:decoration-teal/50"
      >
        {entry.name}
      </Link>
    );
  }

  return <span className="font-medium text-primary">{entry.name}</span>;
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-glass backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            <th className="w-16 px-4 py-3 text-left font-medium text-muted">
              Rank
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted md:table-cell">
              Use Case
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted lg:table-cell">
              Verdict
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.name}-${entry.subcategory}`}
              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3">
                <span className="font-display text-lg font-bold text-muted">
                  {entry.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <EntryName entry={entry} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={entry.status} />
              </td>
              <td className="hidden px-4 py-3 text-muted md:table-cell">
                {entry.use_case}
              </td>
              <td className="hidden px-4 py-3 text-muted lg:table-cell">
                {entry.verdict}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-glass text-4xl backdrop-blur-sm">
        🏆
      </div>
      <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-primary">
        Leaderboard builds over time
      </h2>
      <p className="mb-6 text-muted">
        This is your personal ranked registry of every tool, skill, model, and
        workflow you encounter across your AI documentation journey. Entries are
        added automatically during documentation conversations as you discover
        and evaluate new items.
      </p>
      <div className="inline-flex flex-wrap justify-center gap-2">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <span
            key={type}
            className="rounded-pill border border-white/[0.08] bg-glass px-3 py-1 text-xs text-muted backdrop-blur-sm"
          >
            {config.icon} {config.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const entries = await fetchLeaderboard();
  const grouped = groupLeaderboard(entries);
  const totalEntries = entries.length;
  const usedCount = entries.filter((e) => e.status === "used").length;
  const researchedCount = entries.filter(
    (e) => e.status === "researched"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </Link>

      <div className="mb-10">
        <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-primary">
          Leaderboard
        </h1>
        <p className="text-lg text-muted">
          Personal ranked registry of tools, skills, models, and workflows
        </p>
      </div>

      {totalEntries === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats row */}
          <div className="mb-10 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-display text-2xl font-bold text-primary">
                {totalEntries}
              </span>
              <span className="ml-2 text-muted">
                {totalEntries === 1 ? "Entry" : "Entries"}
              </span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-complete">
                {usedCount}
              </span>
              <span className="ml-2 text-muted">Used</span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-[#3B82F6]">
                {researchedCount}
              </span>
              <span className="ml-2 text-muted">Researched</span>
            </div>
          </div>

          {/* Type sections */}
          <div className="space-y-12">
            {grouped.map((group) => {
              const color = typeColors[group.type] || "#94A3B8";
              return (
                <section key={group.type}>
                  {/* Type header */}
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span aria-hidden="true">{group.icon}</span>
                    </div>
                    <h2
                      className="font-display text-2xl font-bold tracking-tight"
                      style={{ color }}
                    >
                      {group.label}
                    </h2>
                  </div>

                  {/* Subcategory tables */}
                  <div className="space-y-8">
                    {group.subcategories.map((subcat) => (
                      <div key={subcat.subcategory}>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                          {subcat.label}
                        </h3>
                        <LeaderboardTable entries={subcat.entries} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-16 rounded-xl border border-white/[0.08] bg-glass p-6 backdrop-blur-sm">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted">
              Status Legend
            </h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <StatusBadge status="used" />
                <span className="text-muted">
                  Used in a real project or workflow
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="researched" />
                <span className="text-muted">
                  Investigated but not used yet
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
