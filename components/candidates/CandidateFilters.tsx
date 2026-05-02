"use client";

import { useElectionStore } from "@/store/useElectionStore";

interface Props {
  states: string[];
  parties: string[];
  years: number[];
}

export function CandidateFilters({ states, parties, years }: Props) {
  const query = useElectionStore((s) => s.candidateSearchQuery);
  const setQuery = useElectionStore((s) => s.setCandidateSearchQuery);
  const filters = useElectionStore((s) => s.candidateFilters);
  const setFilters = useElectionStore((s) => s.setCandidateFilters);
  const reset = useElectionStore((s) => s.resetCandidateFilters);

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, constituency or party"
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          label="State"
          value={filters.state}
          onChange={(v) => setFilters({ state: v })}
          options={[{ value: "ALL", label: "All states" }, ...states.map((s) => ({ value: s, label: s }))]}
        />
        <Select
          label="Party"
          value={filters.party}
          onChange={(v) => setFilters({ party: v })}
          options={[{ value: "ALL", label: "All parties" }, ...parties.map((p) => ({ value: p, label: p }))]}
        />
        <Select
          label="Year"
          value={filters.year ? String(filters.year) : "ALL"}
          onChange={(v) => setFilters({ year: v === "ALL" ? null : parseInt(v, 10) })}
          options={[{ value: "ALL", label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
        />
        <Select
          label="Type"
          value={filters.electionType}
          onChange={(v) => setFilters({ electionType: v })}
          options={[
            { value: "ALL", label: "All" },
            { value: "LS", label: "Lok Sabha" },
            { value: "VS", label: "Vidhan Sabha" },
          ]}
        />
      </div>

      <button
        onClick={reset}
        className="text-xs text-muted hover:text-accent transition-colors"
      >
        Reset filters
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
