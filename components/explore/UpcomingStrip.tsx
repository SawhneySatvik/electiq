"use client";

import { useT } from "@/lib/translation-runtime";
import type { UpcomingElection } from "@/lib/types";

export function UpcomingStrip({ elections }: { elections: UpcomingElection[] }) {
  if (elections.length === 0) return null;
  const eyebrow = useT("upcoming.eyebrow");
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {elections.map((e, i) => (
        <div
          key={`${e.state}-${e.expected_year}-${e.type}-${i}`}
          className="bg-surface/70 border border-border rounded-xl px-4 py-3"
        >
          <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
            {eyebrow}
          </div>
          <div className="font-display font-bold text-base">
            {e.state} <span className="text-muted font-body font-normal">· {e.type}</span>
          </div>
          <div className="text-xs text-muted">{e.expected_window}</div>
        </div>
      ))}
    </div>
  );
}
