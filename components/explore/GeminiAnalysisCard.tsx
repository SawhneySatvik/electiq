"use client";

import { useConstituencyAnalysis } from "@/hooks/useConstituencyAnalysis";
import { getCharacterBadgeColor } from "@/lib/data-utils";
import { SkeletonLine } from "@/components/ui/LoadingSpinner";
import type { LSConstituency } from "@/lib/types";

export function GeminiAnalysisCard({ constituency }: { constituency: LSConstituency }) {
  const { analysis, loading, error } = useConstituencyAnalysis(constituency);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-0.5">AI analysis</div>
          <h3 className="font-display text-lg font-bold">Constituency analyst</h3>
        </div>
        {loading && (
          <span className="text-xs text-muted animate-pulse-soft">Analysing…</span>
        )}
      </div>

      {loading && !analysis && (
        <div className="space-y-3">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-4/6" />
        </div>
      )}

      {error && (
        <div className="text-sm text-muted">
          <div className="text-text/90 mb-1">Analysis unavailable.</div>
          <div className="text-xs">{error}</div>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider"
              style={{
                background: getCharacterBadgeColor(analysis.character) + "22",
                color: getCharacterBadgeColor(analysis.character),
              }}
            >
              {analysis.character}
            </span>
            <span className="text-xs text-muted">
              Dominant: <span className="text-text/90">{analysis.dominant_party}</span>
            </span>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Trend</div>
            <p className="text-sm text-text/90 leading-relaxed">{analysis.trend_summary}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Key shift</div>
            <p className="text-sm text-text/90 leading-relaxed">{analysis.key_shift}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Competitiveness</div>
            <p className="text-sm text-text/90 leading-relaxed">{analysis.competitiveness}</p>
          </div>

          {analysis.watch_factors && analysis.watch_factors.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted mb-2">Watch factors</div>
              <ul className="space-y-1.5">
                {analysis.watch_factors.map((f, i) => (
                  <li key={i} className="text-sm text-text/90 flex gap-2">
                    <span className="text-accent">·</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
