"use client";

import Link from "next/link";
import { formatAssets, getPartyColor } from "@/lib/data-utils";
import type { Candidate } from "@/lib/types";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const color = getPartyColor(candidate.party);
  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="group block bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg leading-tight group-hover:text-accent transition-colors truncate">
            {candidate.name}
          </h3>
          <div className="text-xs text-muted mt-0.5 truncate">
            {candidate.constituency} · {candidate.state}
          </div>
        </div>
        <span
          className="px-2 py-0.5 rounded text-xs font-mono shrink-0"
          style={{ background: color + "22", color }}
        >
          {candidate.party}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Assets</div>
          <div className="font-display font-bold text-xl">{formatAssets(candidate.total_assets_lakhs)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted">Year · Type</div>
          <div className="text-sm font-medium">
            {candidate.year} · {candidate.election_type}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span
          className={`px-2 py-0.5 rounded font-medium ${
            candidate.criminal_cases === 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {candidate.criminal_cases === 0
            ? "0 criminal cases"
            : `${candidate.criminal_cases} criminal case${candidate.criminal_cases === 1 ? "" : "s"}`}
        </span>
        <span
          className={`px-2 py-0.5 rounded font-medium ${
            candidate.won
              ? "bg-accent/10 text-accent"
              : "bg-surface2 text-muted"
          }`}
        >
          {candidate.won ? "Won" : "Lost"}
        </span>
      </div>
    </Link>
  );
}
