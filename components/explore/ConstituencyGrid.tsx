"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import { getConstituenciesForState, getPartyColor } from "@/lib/data-utils";
import { formatVotes } from "@/lib/data-utils";

export function ConstituencyGrid() {
  const state = useElectionStore((s) => s.selectedState);
  const electionType = useElectionStore((s) => s.selectedElectionType);

  const constituencies = useMemo(() => {
    if (!state) return [];
    return getConstituenciesForState(state, electionType);
  }, [state, electionType]);

  if (!state) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center">
        <div className="text-2xl mb-2">←</div>
        <div className="text-muted">Pick a state to begin</div>
      </div>
    );
  }

  if (constituencies.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center">
        <div className="text-muted">
          No {electionType === "LS" ? "Lok Sabha" : "Vidhan Sabha"} data loaded for {state} in this demo.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl font-bold">
          {state} <span className="text-muted font-body font-normal text-base">— {constituencies.length} {electionType === "LS" ? "LS" : "VS"} seats</span>
        </h2>
        <span className="text-xs text-muted">Sorted by name</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {constituencies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => {
            const partyColor = c.lastResult ? getPartyColor(c.lastResult.party) : "#71717a";
            return (
              <Link
                key={c.id}
                href={`/explore/${c.id}`}
                className="group block bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
              >
                <div
                  className="h-1 rounded-full mb-3"
                  style={{ background: partyColor, opacity: 0.85 }}
                />
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display font-bold text-lg group-hover:text-accent transition-colors">
                    {c.name}
                  </h3>
                  {c.lastResult && (
                    <span className="text-xs text-muted">{c.lastResult.year}</span>
                  )}
                </div>
                {c.lastResult && (
                  <>
                    <div className="text-sm text-text/90 mb-1 truncate">{c.lastResult.winner}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="px-2 py-0.5 rounded font-mono font-medium"
                        style={{ background: partyColor + "22", color: partyColor }}
                      >
                        {c.lastResult.party}
                      </span>
                      <span className="text-muted">
                        {c.lastResult.margin > 0
                          ? `+${formatVotes(c.lastResult.margin)} margin`
                          : "Unopposed"}
                      </span>
                    </div>
                  </>
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
