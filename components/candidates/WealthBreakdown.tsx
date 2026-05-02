"use client";

import { formatAssets } from "@/lib/data-utils";
import type { Candidate } from "@/lib/types";

const TYPICAL_LS_AVG_ASSETS_LAKHS = 1000;

export function WealthBreakdown({ candidate }: { candidate: Candidate }) {
  const movable = candidate.assets_breakdown.movable_assets_lakhs;
  const immovable = candidate.assets_breakdown.immovable_assets_lakhs;
  const total = candidate.total_assets_lakhs || 1;
  const movablePct = (movable / total) * 100;
  const immovablePct = (immovable / total) * 100;
  const netWorth = candidate.total_assets_lakhs - candidate.total_liabilities_lakhs;
  const ratio = Math.min(20, candidate.total_assets_lakhs / TYPICAL_LS_AVG_ASSETS_LAKHS);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted mb-1">Total assets</div>
        <div className="font-display text-3xl font-bold">{formatAssets(candidate.total_assets_lakhs)}</div>
        <div className="text-xs text-muted mt-1">
          Net worth (after liabilities) {formatAssets(netWorth)}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted mb-2">Composition</div>
        <div className="h-2 bg-surface2 rounded-full overflow-hidden flex">
          <div className="h-full bg-accent" style={{ width: `${movablePct}%` }} />
          <div className="h-full bg-blue-500" style={{ width: `${immovablePct}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <div>
            <span className="text-accent">●</span> Movable {formatAssets(movable)}
          </div>
          <div>
            <span className="text-blue-500">●</span> Immovable {formatAssets(immovable)}
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted mb-2">
          Vs typical candidate (~₹10 Cr)
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold">{ratio.toFixed(1)}×</span>
          <span className="text-xs text-muted">
            {ratio >= 5 ? "well above average" : ratio >= 1 ? "above average" : "below average"}
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted mb-1">Liabilities</div>
        <div className="font-display font-bold">{formatAssets(candidate.total_liabilities_lakhs)}</div>
      </div>
    </div>
  );
}
