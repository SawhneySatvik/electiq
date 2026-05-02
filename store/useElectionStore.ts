"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ChatContextRecord,
  ConstituencyAnalysis,
  CandidateFilters,
  ElectionType,
} from "@/lib/types";

interface ElectionState {
  selectedState: string | null;
  selectedElectionType: ElectionType;
  selectedConstituencyId: string | null;
  constituencyAnalysis: ConstituencyAnalysis | null;
  analysisLoading: boolean;
  analysisError: string | null;

  candidateSearchQuery: string;
  candidateFilters: CandidateFilters;
  selectedCandidateId: string | null;

  messages: ChatMessage[];
  chatContext: ChatContextRecord[];
  chatLoading: boolean;

  setSelectedState: (state: string | null) => void;
  setSelectedElectionType: (t: ElectionType) => void;
  setSelectedConstituencyId: (id: string | null) => void;
  setAnalysis: (a: ConstituencyAnalysis | null) => void;
  setAnalysisLoading: (loading: boolean) => void;
  setAnalysisError: (err: string | null) => void;

  setCandidateSearchQuery: (q: string) => void;
  setCandidateFilters: (f: Partial<CandidateFilters>) => void;
  setSelectedCandidateId: (id: string | null) => void;
  resetCandidateFilters: () => void;

  pushMessage: (msg: ChatMessage) => void;
  appendToLastAssistantMessage: (chunk: string) => void;
  setChatContext: (records: ChatContextRecord[]) => void;
  setChatLoading: (loading: boolean) => void;
  resetChat: () => void;
}

const DEFAULT_FILTERS: CandidateFilters = {
  state: "ALL",
  party: "ALL",
  year: null,
  electionType: "ALL",
};

export const useElectionStore = create<ElectionState>((set) => ({
  selectedState: null,
  selectedElectionType: "LS",
  selectedConstituencyId: null,
  constituencyAnalysis: null,
  analysisLoading: false,
  analysisError: null,

  candidateSearchQuery: "",
  candidateFilters: { ...DEFAULT_FILTERS },
  selectedCandidateId: null,

  messages: [],
  chatContext: [],
  chatLoading: false,

  setSelectedState: (state) => set({ selectedState: state }),
  setSelectedElectionType: (t) => set({ selectedElectionType: t }),
  setSelectedConstituencyId: (id) => set({ selectedConstituencyId: id }),
  setAnalysis: (a) => set({ constituencyAnalysis: a }),
  setAnalysisLoading: (loading) => set({ analysisLoading: loading }),
  setAnalysisError: (err) => set({ analysisError: err }),

  setCandidateSearchQuery: (q) => set({ candidateSearchQuery: q }),
  setCandidateFilters: (f) =>
    set((s) => ({ candidateFilters: { ...s.candidateFilters, ...f } })),
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
  resetCandidateFilters: () =>
    set({ candidateFilters: { ...DEFAULT_FILTERS }, candidateSearchQuery: "" }),

  pushMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendToLastAssistantMessage: (chunk) =>
    set((s) => {
      if (s.messages.length === 0) return s;
      const last = s.messages[s.messages.length - 1];
      if (last.role !== "assistant") return s;
      const updated: ChatMessage = { ...last, content: last.content + chunk };
      return { messages: [...s.messages.slice(0, -1), updated] };
    }),
  setChatContext: (records) => set({ chatContext: records }),
  setChatLoading: (loading) => set({ chatLoading: loading }),
  resetChat: () => set({ messages: [], chatContext: [], chatLoading: false }),
}));
