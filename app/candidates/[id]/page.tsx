import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateById } from "@/lib/data-utils";
import { getPartyColor } from "@/lib/data-utils";
import { WealthBreakdown } from "@/components/candidates/WealthBreakdown";
import { CandidateInsightCard } from "@/components/candidates/CandidateInsightCard";

interface Props {
  params: { id: string };
}

export default function CandidateProfilePage({ params }: Props) {
  const c = getCandidateById(params.id);
  if (!c) notFound();

  const partyColor = getPartyColor(c.party);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link href="/candidates" className="text-xs text-muted hover:text-accent transition-colors">
        ← Back to candidates
      </Link>

      <header className="mt-3 mb-10">
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">{c.name}</h1>
          <span
            className="px-2 py-0.5 rounded text-sm font-mono"
            style={{ background: partyColor + "22", color: partyColor }}
          >
            {c.party}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              c.won ? "bg-accent/10 text-accent" : "bg-surface2 text-muted"
            }`}
          >
            {c.won ? "Won" : "Lost"}
          </span>
        </div>
        <div className="text-muted">
          {c.constituency} · {c.state} · {c.election_type === "LS" ? "Lok Sabha" : "Vidhan Sabha"} {c.year}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <WealthBreakdown candidate={c} />
          <DetailsCard
            items={[
              { label: "Age", value: `${c.age} years` },
              { label: "Education", value: c.education },
              { label: "PAN declared", value: c.pan_declared ? "Yes" : "No" },
              { label: "ITR filed", value: c.itr_filed ? "Yes" : "No" },
            ]}
          />
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted mb-2">Criminal cases</div>
            <div
              className={`font-display text-2xl font-bold mb-2 ${
                c.criminal_cases === 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {c.criminal_cases === 0 ? "Clean record declared" : `${c.criminal_cases} declared`}
            </div>
            <p className="text-sm text-text/90 leading-relaxed">{c.criminal_cases_detail}</p>
          </div>
        </div>

        <div className="space-y-6">
          <CandidateInsightCard candidate={c} />
          <Link
            href={`/candidates?constituency=${encodeURIComponent(c.constituency_id)}`}
            className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/60 transition-colors"
          >
            <div className="text-xs uppercase tracking-widest text-muted mb-1">Constituency</div>
            <div className="font-display font-bold mb-1">
              See all candidates from {c.constituency}
            </div>
            <div className="text-xs text-muted">Compare wealth and criminal records side by side</div>
          </Link>
          <Link
            href={`/explore/${encodeURIComponent(c.constituency_id)}`}
            className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/60 transition-colors"
          >
            <div className="text-xs uppercase tracking-widest text-muted mb-1">Seat history</div>
            <div className="font-display font-bold mb-1">View {c.constituency} race history</div>
            <div className="text-xs text-muted">Margins, turnout, dominant party</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailsCard({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">Profile</div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <dt className="text-xs text-muted">{it.label}</dt>
            <dd className="text-sm text-text/90 mt-0.5">{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
