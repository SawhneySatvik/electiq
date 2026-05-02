"use client";

import { useEffect, useRef } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import type { ConstituencyAnalysis, LSConstituency } from "@/lib/types";

export function useConstituencyAnalysis(constituency: LSConstituency | null) {
  const setAnalysis = useElectionStore((s) => s.setAnalysis);
  const setAnalysisLoading = useElectionStore((s) => s.setAnalysisLoading);
  const setAnalysisError = useElectionStore((s) => s.setAnalysisError);
  const analysis = useElectionStore((s) => s.constituencyAnalysis);
  const loading = useElectionStore((s) => s.analysisLoading);
  const error = useElectionStore((s) => s.analysisError);

  const inflightId = useRef<string | null>(null);

  useEffect(() => {
    if (!constituency) {
      setAnalysis(null);
      setAnalysisError(null);
      return;
    }
    if (inflightId.current === constituency.id) return;
    inflightId.current = constituency.id;

    let cancelled = false;
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    fetch("/api/analyse-constituency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ constituency }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((data: { analysis: ConstituencyAnalysis }) => {
        if (cancelled) return;
        setAnalysis(data.analysis);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setAnalysisError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAnalysisLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [constituency, setAnalysis, setAnalysisLoading, setAnalysisError]);

  return { analysis, loading, error };
}
