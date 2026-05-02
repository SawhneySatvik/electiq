"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { useCandidateSearch } from "@/hooks/useCandidateSearch";
import { useElectionStore } from "@/store/useElectionStore";
import { getCandidatesByConstituency, getConstituencyById } from "@/lib/data-utils";

interface Props {
  states: string[];
  parties: string[];
  years: number[];
}

export function CandidatesClient({ states, parties, years }: Props) {
  const params = useSearchParams();
  const constituencyId = params.get("constituency");
  const setQuery = useElectionStore((s) => s.setCandidateSearchQuery);

  useEffect(() => {
    if (constituencyId) {
      const c = getConstituencyById(constituencyId);
      if (c) {
        const name = c.type === "LS" ? c.data.name : c.data.name;
        setQuery(name);
      }
    }
  }, [constituencyId, setQuery]);

  const allResults = useCandidateSearch();
  const results = constituencyId
    ? getCandidatesByConstituency(constituencyId)
    : allResults;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Candidates</h1>
        <p className="text-muted">
          Affidavit-declared assets, criminal cases, education. Search any candidate.
        </p>
      </div>

      {!constituencyId && (
        <div className="mb-8">
          <CandidateFilters states={states} parties={parties} years={years} />
        </div>
      )}

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">
          {results.length} result{results.length === 1 ? "" : "s"}
        </h2>
        {constituencyId && (
          <a href="/candidates" className="text-xs text-muted hover:text-accent transition-colors">
            Clear constituency filter
          </a>
        )}
      </div>

      {results.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted">
          No candidates match these filters. Try resetting.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
