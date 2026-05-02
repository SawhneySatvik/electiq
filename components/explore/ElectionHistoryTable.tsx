"use client";

import { formatVotes, getPartyColor } from "@/lib/data-utils";
import type { LSResult } from "@/lib/types";

interface Row {
  year: number;
  winner: string;
  party: string;
  votes: number;
  margin: number;
  turnout: number;
  runner_up: string;
  runner_up_party: string;
}

interface Props {
  rows: Row[] | LSResult[];
}

export function ElectionHistoryTable({ rows }: Props) {
  const sorted = [...rows].sort((a, b) => b.year - a.year);
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold">Result history</h3>
        <span className="text-xs text-muted">{rows.length} contest{rows.length === 1 ? "" : "s"}</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Year</th>
              <th className="px-4 py-2 font-medium">Winner</th>
              <th className="px-4 py-2 font-medium">Party</th>
              <th className="px-4 py-2 font-medium text-right">Votes</th>
              <th className="px-4 py-2 font-medium text-right">Margin</th>
              <th className="px-4 py-2 font-medium text-right">Turnout</th>
              <th className="px-4 py-2 font-medium">Runner-up</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const color = getPartyColor(r.party);
              return (
                <tr key={r.year} className="border-t border-border hover:bg-surface2/40">
                  <td className="px-4 py-3 font-mono text-text/90">{r.year}</td>
                  <td className="px-4 py-3 font-medium">{r.winner}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-mono"
                      style={{ background: color + "22", color }}
                    >
                      {r.party}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text/90">
                    {r.votes > 0 ? formatVotes(r.votes) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text/90">
                    {r.margin > 0 ? `+${formatVotes(r.margin)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">
                    {r.turnout > 0 ? `${r.turnout.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.runner_up}{" "}
                    {r.runner_up_party && r.runner_up_party !== "—" && (
                      <span className="text-xs">({r.runner_up_party})</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
