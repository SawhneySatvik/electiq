"use client";

import Link from "next/link";
import type { ChatContextRecord } from "@/lib/types";

const TYPE_LABEL: Record<ChatContextRecord["type"], string> = {
  constituency: "LS seat",
  vs_constituency: "VS seat",
  candidate: "Candidate",
};

const TYPE_COLOR: Record<ChatContextRecord["type"], string> = {
  constituency: "#f97316",
  vs_constituency: "#06b6d4",
  candidate: "#10b981",
};

export function ContextPreview({ records }: { records: ChatContextRecord[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-0.5">RAG context</div>
          <h3 className="font-display text-lg font-bold">Retrieved records</h3>
        </div>
        <span className="text-xs text-muted">{records.length}</span>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-muted leading-relaxed">
          The retrieval layer extracts state, party, year, and known names from your
          question, then scores every record. Top matches appear here so you can see
          exactly what the model used to answer.
        </p>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => {
            const color = TYPE_COLOR[r.type];
            const href =
              r.type === "candidate"
                ? `/candidates/${r.id}`
                : `/explore/${r.id}`;
            return (
              <li key={`${r.type}-${r.id}`}>
                <Link
                  href={href}
                  className="block bg-surface2/40 hover:bg-surface2 border border-border rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider"
                      style={{ background: color + "22", color }}
                    >
                      {TYPE_LABEL[r.type]}
                    </span>
                    <span className="text-[10px] text-muted font-mono">{r.id}</span>
                  </div>
                  <div className="text-sm text-text/90 leading-tight">{r.label}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
