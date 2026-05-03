"use client";

import { useT } from "@/lib/translation-runtime";
import { getPartyColor } from "@/lib/data-utils";
import type { RajyaSabhaState } from "@/lib/types";

export function RajyaSabhaCard({ data }: { data: RajyaSabhaState | undefined }) {
  const title = useT("rajyaSabha.title");
  const seatsLabel = useT("rajyaSabha.seats", { count: data?.seats ?? 0 });
  const termLabel = useT("rajyaSabha.term");
  const empty = useT("rajyaSabha.empty");

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-0.5">{title}</div>
          {data && <div className="text-xs text-muted">{seatsLabel}</div>}
        </div>
      </div>
      {!data || data.members.length === 0 ? (
        <p className="text-sm text-muted leading-relaxed">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {data.members.map((m) => {
            const color = getPartyColor(m.party);
            return (
              <li
                key={`${m.name}-${m.term_start}`}
                className="flex items-baseline justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm text-text/90 truncate">{m.name}</div>
                  <div className="text-[10px] text-muted">
                    {termLabel} {m.term_start} – {m.term_end}
                  </div>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0"
                  style={{ background: color + "22", color }}
                >
                  {m.party}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
