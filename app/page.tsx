"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import {
  getLokSabhaData,
  getStateElectionData,
  getCandidatesData,
  getAllStates,
  getNextElections,
} from "@/lib/data-utils";
import { useT } from "@/lib/translation-runtime";
import { UpcomingStrip } from "@/components/explore/UpcomingStrip";

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
  const upcoming = getNextElections(3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-full text-xs text-muted mb-6 bg-surface/50">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            {useT("home.badge")}
          </div>
          <h1 className="font-display font-bold text-6xl md:text-7xl tracking-tighter mb-6 leading-[0.95]">
            {useT("home.title.1")}
            <br />
            <span className="text-accent">{useT("home.title.2")}</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mb-10 leading-relaxed">
            {useT("home.subtitle")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            <StatCard
              value={ls.length}
              label={useT("home.stats.lsConstituencies")}
              subtitle={useT("home.stats.lsConstituenciesSub")}
            />
            <StatCard
              value={totalElections}
              label={useT("home.stats.electionResults")}
              subtitle={useT("home.stats.electionResultsSub")}
            />
            <StatCard
              value={candidates.length}
              label={useT("home.stats.candidates")}
              subtitle={useT("home.stats.candidatesSub")}
            />
            <StatCard value={states.length} label={useT("home.stats.statesCovered")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CTACard
              href="/explore"
              eyebrow={useT("home.cta.explore.eyebrow")}
              title={useT("home.cta.explore.title")}
              copy={useT("home.cta.explore.copy")}
              openLabel={useT("home.cta.open")}
            />
            <CTACard
              href="/candidates"
              eyebrow={useT("home.cta.candidates.eyebrow")}
              title={useT("home.cta.candidates.title")}
              copy={useT("home.cta.candidates.copy")}
              openLabel={useT("home.cta.open")}
            />
            <CTACard
              href="/chat"
              eyebrow={useT("home.cta.chat.eyebrow")}
              title={useT("home.cta.chat.title")}
              copy={useT("home.cta.chat.copy")}
              openLabel={useT("home.cta.open")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <CTACard
              href="/voices"
              eyebrow={useT("home.cta.voices.eyebrow")}
              title={useT("home.cta.voices.title")}
              copy={useT("home.cta.voices.copy")}
              openLabel={useT("home.cta.open")}
            />
            <CTACard
              href="/exit-poll"
              eyebrow={useT("home.cta.exitPoll.eyebrow")}
              title={useT("home.cta.exitPoll.title")}
              copy={useT("home.cta.exitPoll.copy")}
              openLabel={useT("home.cta.open")}
            />
          </div>

          <UpcomingStrip elections={upcoming} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Pillar num="01" title={useT("home.pillar.1.title")} body={useT("home.pillar.1.body")} />
          <Pillar num="02" title={useT("home.pillar.2.title")} body={useT("home.pillar.2.body")} />
          <Pillar num="03" title={useT("home.pillar.3.title")} body={useT("home.pillar.3.body")} />
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
  openLabel,
}: {
  href: string;
  eyebrow: string;
  title: string;
  copy: string;
  openLabel: string;
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
        {openLabel}
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
