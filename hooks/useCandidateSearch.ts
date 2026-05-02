"use client";

import { useMemo } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import { searchCandidates } from "@/lib/data-utils";

export function useCandidateSearch() {
  const query = useElectionStore((s) => s.candidateSearchQuery);
  const filters = useElectionStore((s) => s.candidateFilters);
  return useMemo(() => searchCandidates(query, filters), [query, filters]);
}
