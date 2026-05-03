"use client";

import { useConstituencyAnalysis } from "@/hooks/useConstituencyAnalysis";
import { getCharacterBadgeColor } from "@/lib/data-utils";
import { SkeletonLine } from "@/components/ui/LoadingSpinner";
import { useT } from "@/lib/translation-runtime";
import type { ConstituencyProfile, LSConstituency } from "@/lib/types";

export function GeminiAnalysisCard({
  constituency,
  profile,
}: {
  constituency: LSConstituency;
  profile?: ConstituencyProfile;
}) {
  const { analysis, loading, error } = useConstituencyAnalysis(constituency, profile ?? null);

  const eyebrow = useT("analysis.eyebrow");
  const title = useT("analysis.title");
  const analysing = useT("analysis.analysing");
  const dominantLabel = useT("analysis.dominant");
  const trendLabel = useT("analysis.trend");
  const keyShiftLabel = useT("analysis.keyShift");
  const competitivenessLabel = useT("analysis.competitiveness");
  const watchLabel = useT("analysis.watch");
  const demoLabel = useT("analysis.demographics");
  const issuesLabel = useT("analysis.issues");
  const historyLabel = useT("analysis.history");
  const safetyLabel = useT("analysis.safety");
  const contextLabel = useT("analysis.context");
  const unavailable = useT("analysis.unavailable");

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-0.5">{eyebrow}</div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
        </div>
        {loading && <span className="text-xs text-muted animate-pulse-soft">{analysing}</span>}
      </div>

      {loading && !analysis && (
        <div className="space-y-3">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-4/6" />
          <SkeletonLine className="w-3/4" />
        </div>
      )}

      {error && (
        <div className="text-sm text-muted">
          <div className="text-text/90 mb-1">{unavailable}</div>
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
              {dominantLabel}: <span className="text-text/90">{analysis.dominant_party}</span>
            </span>
          </div>

          {analysis.sociopolitical_context && (
            <div className="rounded-lg bg-bg/40 border border-border px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                {contextLabel}
              </div>
              <p className="text-sm text-text/90 leading-relaxed">
                {analysis.sociopolitical_context}
              </p>
            </div>
          )}

          <Section label={trendLabel} body={analysis.trend_summary} />
          <Section label={keyShiftLabel} body={analysis.key_shift} />
          <Section label={competitivenessLabel} body={analysis.competitiveness} />

          {analysis.demographics_summary && (
            <Section label={demoLabel} body={analysis.demographics_summary} />
          )}
          {analysis.key_issues_synthesis && (
            <Section label={issuesLabel} body={analysis.key_issues_synthesis} />
          )}
          {analysis.notable_history_summary && (
            <Section label={historyLabel} body={analysis.notable_history_summary} />
          )}
          {analysis.electoral_safety && (
            <Section label={safetyLabel} body={analysis.electoral_safety} />
          )}

          {analysis.watch_factors && analysis.watch_factors.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted mb-2">{watchLabel}</div>
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

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted mb-1">{label}</div>
      <p className="text-sm text-text/90 leading-relaxed">{body}</p>
    </div>
  );
}
