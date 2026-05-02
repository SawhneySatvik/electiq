"use client";

import { useElectionStore } from "@/store/useElectionStore";

interface StateSelectorProps {
  states: string[];
}

export function StateSelector({ states }: StateSelectorProps) {
  const selected = useElectionStore((s) => s.selectedState);
  const setSelected = useElectionStore((s) => s.setSelectedState);

  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-widest text-muted mb-3">State</div>
      <div className="flex flex-wrap gap-2">
        {states.map((state) => {
          const active = selected === state;
          return (
            <button
              key={state}
              onClick={() => setSelected(state)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-accent text-bg border-accent"
                  : "bg-surface border-border text-text/85 hover:border-accent/60"
              }`}
            >
              {state}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ElectionTypeToggle() {
  const t = useElectionStore((s) => s.selectedElectionType);
  const setT = useElectionStore((s) => s.setSelectedElectionType);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        Election type
      </div>
      <div className="inline-flex bg-surface border border-border rounded-lg p-1">
        <button
          onClick={() => setT("LS")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            t === "LS" ? "bg-surface2 text-text" : "text-muted hover:text-text"
          }`}
        >
          Lok Sabha
        </button>
        <button
          onClick={() => setT("VS")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            t === "VS" ? "bg-surface2 text-text" : "text-muted hover:text-text"
          }`}
        >
          Vidhan Sabha
        </button>
      </div>
    </div>
  );
}
