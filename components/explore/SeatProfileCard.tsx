"use client";

import { useT } from "@/lib/translation-runtime";
import type { ConstituencyProfile } from "@/lib/types";

function formatHumans(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
  return String(n);
}

export function SeatProfileCard({ profile }: { profile: ConstituencyProfile | undefined }) {
  const title = useT("seat.profile.title");
  const empty = useT("seat.profile.empty");
  const popLabel = useT("seat.profile.population");
  const electorsLabel = useT("seat.profile.electors");
  const literacyLabel = useT("seat.profile.literacy");
  const splitLabel = useT("seat.profile.split");
  const communitiesLabel = useT("seat.profile.communities");
  const issuesLabel = useT("seat.profile.issues");
  const historyLabel = useT("seat.profile.history");
  const violenceLabel = useT("seat.profile.violence");
  const dqLabel = useT("seat.profile.dq");

  if (!profile) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="text-xs uppercase tracking-widest text-accent mb-1">{title}</div>
        <p className="text-sm text-muted leading-relaxed">{empty}</p>
      </div>
    );
  }

  const popValue = profile.population_estimate_recent
    ? `${formatHumans(profile.population_2011)} → ~${formatHumans(profile.population_estimate_recent)}`
    : formatHumans(profile.population_2011);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-widest text-accent mb-3">{title}</div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <Stat label={popLabel} value={popValue} />
        <Stat label={electorsLabel} value={formatHumans(profile.electors_recent)} />
        <Stat label={literacyLabel} value={`${profile.literacy_rate_pct}%`} />
        <Stat label={splitLabel} value={profile.urban_rural_split} />
      </dl>

      <Section label={communitiesLabel}>
        <p className="text-sm text-text/90 leading-relaxed">
          {profile.major_communities.join(" · ")}
        </p>
      </Section>

      <Section label={issuesLabel}>
        <ul className="flex flex-wrap gap-1.5">
          {profile.key_issues.map((k) => (
            <li
              key={k}
              className="text-xs px-2 py-0.5 rounded-full border border-border bg-bg/40 text-text/85"
            >
              {k}
            </li>
          ))}
        </ul>
      </Section>

      <Section label={historyLabel}>
        <ul className="space-y-1.5">
          {profile.notable_history.map((h, i) => (
            <li key={i} className="text-sm text-text/90 flex gap-2 leading-relaxed">
              <span className="text-accent">·</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </Section>

      {profile.poll_violence_notes && profile.poll_violence_notes.length > 0 && (
        <Section label={violenceLabel}>
          <ul className="space-y-1.5">
            {profile.poll_violence_notes.map((v, i) => (
              <li key={i} className="text-sm text-text/90 flex gap-2 leading-relaxed">
                <span className="font-mono text-xs text-amber-400 shrink-0">{v.year}</span>
                <span>{v.note}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {profile.data_quality_note && (
        <p className="mt-4 text-[11px] text-muted leading-relaxed border-t border-border pt-3">
          <span className="uppercase tracking-widest mr-1">{dqLabel}</span>
          {profile.data_quality_note}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted">{label}</dt>
      <dd className="text-sm text-text/90 font-medium mt-0.5">{value}</dd>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-xs uppercase tracking-wider text-muted mb-1.5">{label}</div>
      {children}
    </div>
  );
}
