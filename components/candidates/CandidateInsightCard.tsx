"use client";

import { useEffect, useState } from "react";
import { SkeletonLine } from "@/components/ui/LoadingSpinner";
import type { Candidate, CandidateInsight } from "@/lib/types";
import { useLocale } from "@/lib/translation-runtime";

export function CandidateInsightCard({ candidate }: { candidate: Candidate }) {
  const [insight, setInsight] = useState<CandidateInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setInsight(null);
    fetch("/api/analyse-candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate, locale }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((data: { insight: CandidateInsight }) => {
        if (!cancelled) setInsight(data.insight);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [candidate, locale]);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-0.5">AI insight</div>
          <h3 className="font-display text-lg font-bold">Affidavit context</h3>
        </div>
        {loading && <span className="text-xs text-muted animate-pulse-soft">Reading…</span>}
      </div>

      {loading && !insight && (
        <div className="space-y-3">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-3/6" />
        </div>
      )}

      {error && (
        <div className="text-sm text-muted">
          <div className="text-text/90 mb-1">Insight unavailable.</div>
          <div className="text-xs">{error}</div>
        </div>
      )}

      {insight && (
        <div className="space-y-4">
          <Section label="Wealth" body={insight.wealth_summary} />
          <Section label="Context" body={insight.wealth_context} />
          <Section label="Liabilities" body={insight.liability_note} />
          <Section label="Criminal record" body={insight.criminal_context} />
          <Section label="Profile" body={insight.overall_profile} />
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
