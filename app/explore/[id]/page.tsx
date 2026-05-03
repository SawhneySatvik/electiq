import Link from "next/link";
import { notFound } from "next/navigation";
import { ElectionHistoryTable } from "@/components/explore/ElectionHistoryTable";
import { MarginTrendChart } from "@/components/explore/MarginTrendChart";
import { GeminiAnalysisCard } from "@/components/explore/GeminiAnalysisCard";
import { RajyaSabhaCard } from "@/components/explore/RajyaSabhaCard";
import { SeatProfileCard } from "@/components/explore/SeatProfileCard";
import {
  getConstituencyById,
  getCandidatesByConstituency,
  getRajyaSabhaForState,
  getSeatProfile,
} from "@/lib/data-utils";

interface Props {
  params: { id: string };
}

export default function ConstituencyPage({ params }: Props) {
  const result = getConstituencyById(params.id);
  if (!result) notFound();

  const candidates = getCandidatesByConstituency(params.id);

  if (result.type === "LS") {
    const c = result.data;
    const rs = getRajyaSabhaForState(c.state);
    const profile = getSeatProfile(c.id);
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/explore" className="text-xs text-muted hover:text-accent transition-colors">
          ← Back to explore
        </Link>
        <div className="mt-3 mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="font-display text-4xl font-bold tracking-tight">{c.name}</h1>
            <span className="text-xs px-2 py-1 rounded bg-surface border border-border text-muted">
              {c.reserved}
            </span>
          </div>
          <div className="text-muted">
            {c.state} · Lok Sabha · {c.results.length} contests on record
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6 min-w-0">
            <ElectionHistoryTable rows={c.results} />
            <MarginTrendChart rows={c.results} />
            <SeatProfileCard profile={profile} />
          </div>
          <div className="space-y-4">
            <GeminiAnalysisCard
              constituency={{
                id: c.id,
                name: c.name,
                state: c.state,
                reserved: c.reserved,
                results: c.results,
              }}
              profile={profile}
            />
            <Link
              href={`/candidates?constituency=${encodeURIComponent(c.id)}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/60 transition-colors"
            >
              <div className="text-xs uppercase tracking-widest text-muted mb-1">
                Candidates
              </div>
              <div className="font-display font-bold mb-1">
                {candidates.length > 0
                  ? `View ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`
                  : "Candidates filtered to this seat"}
              </div>
              <div className="text-xs text-muted">
                Affidavit-declared assets, criminal cases, education
              </div>
            </Link>
            <RajyaSabhaCard data={rs} />
          </div>
        </div>
      </div>
    );
  }

  const c = result.data;
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link href="/explore" className="text-xs text-muted hover:text-accent transition-colors">
        ← Back to explore
      </Link>
      <div className="mt-3 mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-1">{c.name}</h1>
        <div className="text-muted">
          {c.state} · Vidhan Sabha · {c.year}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="min-w-0">
          <ElectionHistoryTable
            rows={[
              {
                year: c.year,
                winner: c.winner,
                party: c.party,
                votes: c.votes,
                margin: c.margin,
                turnout: c.turnout,
                runner_up: c.runner_up,
                runner_up_party: c.runner_up_party,
              },
            ]}
          />
        </div>
        <div>
          <Link
            href={`/candidates?constituency=${encodeURIComponent(c.id)}`}
            className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/60 transition-colors"
          >
            <div className="text-xs uppercase tracking-widest text-muted mb-1">Candidates</div>
            <div className="font-display font-bold mb-1">
              {candidates.length > 0
                ? `View ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`
                : "No candidate affidavits loaded"}
            </div>
            <div className="text-xs text-muted">
              {candidates.length > 0
                ? "Affidavit-declared assets, criminal cases, education"
                : "Try a different seat from the explore index"}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
