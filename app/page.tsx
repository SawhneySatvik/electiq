import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import {
  getLokSabhaData,
  getStateElectionData,
  getCandidatesData,
  getAllStates,
} from "@/lib/data-utils";

export default function Home() {
  const ls = getLokSabhaData();
  const vs = getStateElectionData();
  const candidates = getCandidatesData();
  const states = getAllStates();

  const totalLSResults = ls.reduce((acc, c) => acc + c.results.length, 0);
  const totalVSResults = vs.reduce(
    (acc, se) => acc + se.elections.reduce((a, e) => a + e.constituencies.length, 0),
    0,
  );
  const totalElections = totalLSResults + totalVSResults;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-full text-xs text-muted mb-6 bg-surface/50">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            India · Election Intelligence · Demo
          </div>
          <h1 className="font-display font-bold text-6xl md:text-7xl tracking-tighter mb-6 leading-[0.95]">
            India&rsquo;s elections.
            <br />
            <span className="text-accent">Explored.</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mb-10 leading-relaxed">
            Three decades of constituency results. Every candidate&rsquo;s declared wealth.
            A grounded chatbot for plain-English queries.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            <StatCard value={ls.length} label="LS constituencies" subtitle="across 12 states" />
            <StatCard value={totalElections} label="Election results" subtitle="LS + Vidhan Sabha" />
            <StatCard value={candidates.length} label="Candidates" subtitle="with affidavit data" />
            <StatCard value={states.length} label="States covered" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CTACard
              href="/explore"
              eyebrow="01 / Explore"
              title="State by state"
              copy="Walk through every Lok Sabha and major Vidhan Sabha race. See who won, by how much, and how the seat has shifted."
            />
            <CTACard
              href="/candidates"
              eyebrow="02 / Candidates"
              title="Wealth & cases"
              copy="Search any candidate by name, party, or constituency. See declared assets, criminal cases, and education."
            />
            <CTACard
              href="/chat"
              eyebrow="03 / Chat"
              title="Ask the data"
              copy="Plain-English questions, grounded answers. Every response shows the records the AI used."
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Pillar
            num="01"
            title="Constituency analyst"
            body="A character read of each seat — stronghold, swing, or volatile — plus the most significant shift across four election cycles."
          />
          <Pillar
            num="02"
            title="Candidate transparency"
            body="Affidavit-declared assets translated to plain language. Liabilities, criminal cases, education — laid out side by side."
          />
          <Pillar
            num="03"
            title="Grounded chat"
            body="Keyword-based RAG over the dataset. The chatbot only states facts present in the retrieved records, and shows you which records they were."
          />
        </div>
      </section>
    </div>
  );
}

function CTACard({
  href,
  eyebrow,
  title,
  copy,
}: {
  href: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-surface border border-border rounded-xl p-6 hover:border-accent/60 hover:shadow-glow transition-all"
    >
      <div className="text-xs uppercase tracking-widest text-muted mb-3">{eyebrow}</div>
      <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted leading-relaxed mb-4">{copy}</p>
      <div className="flex items-center gap-1 text-xs font-medium text-accent">
        Open
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </Link>
  );
}

function Pillar({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-mono text-accent mb-3">{num}</div>
      <h3 className="font-display text-2xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}
