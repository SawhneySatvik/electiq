"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useT } from "@/lib/translation-runtime";
import { useAuth } from "@/lib/auth";
import {
  castVote,
  electionKey,
  getMyVote,
  isFirebaseBacked,
  subscribeTally,
  type ExitPollTally,
} from "@/lib/exit-poll-store";
import { getCredibleParties, getPartyColor, getUpcomingElections } from "@/lib/data-utils";
import type { UpcomingElection } from "@/lib/types";

const TOP_PARTIES_LIMIT = 12;

function statusKey(status: string): "exitPoll.statusCompleted" | "exitPoll.statusScheduled" {
  return status === "polling completed" ? "exitPoll.statusCompleted" : "exitPoll.statusScheduled";
}

export default function ExitPollPage() {
  const auth = useAuth();
  const elections = useMemo(() => getUpcomingElections(), []);
  const [selectedKey, setSelectedKey] = useState<string>(() =>
    elections[0] ? electionKey(elections[0]) : "",
  );
  const [pickedParty, setPickedParty] = useState("");
  const [tally, setTally] = useState<ExitPollTally>({ total: 0, byParty: {} });
  const [myVote, setMyVote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backed = isFirebaseBacked();

  const title = useT("exitPoll.title");
  const subtitle = useT("exitPoll.subtitle");
  const warning = useT("exitPoll.warning");
  const pickElectionLabel = useT("exitPoll.pickElection");
  const pickPartyLabel = useT("exitPoll.pickParty");
  const submit = useT("exitPoll.submit");
  const alreadyVoted = useT("exitPoll.alreadyVoted");
  const completedLabel = useT("exitPoll.statusCompleted");
  const scheduledLabel = useT("exitPoll.statusScheduled");
  const fbConnected = useT("exitPoll.banner.firebaseConnected");
  const fbMissing = useT("exitPoll.banner.firebaseMissing");
  const identitySwitchWarn = useT("exitPoll.identitySwitchWarn");
  const yourUid = useT("exitPoll.yourUid");
  const expectedWindowTpl = useT("exitPoll.expectedWindow", {
    window: elections.find((e) => electionKey(e) === selectedKey)?.expected_window ?? "",
  });

  const selected: UpcomingElection | undefined = elections.find(
    (e) => electionKey(e) === selectedKey,
  );

  useEffect(() => {
    if (!selectedKey) return;
    const unsub = subscribeTally(selectedKey, setTally);
    return () => unsub();
  }, [selectedKey]);

  useEffect(() => {
    if (!selectedKey) return;
    let cancelled = false;
    getMyVote(selectedKey, auth.uid).then((v) => {
      if (!cancelled) setMyVote(v);
    });
    setPickedParty("");
    setError(null);
    return () => {
      cancelled = true;
    };
  }, [selectedKey, auth.uid]);

  const labelFor = (e: UpcomingElection) =>
    `${e.state} · ${e.type} · ${e.expected_year}`;
  const tallyTitle = useT("exitPoll.tallyTitle", {
    label: selected ? labelFor(selected) : "",
  });
  const totalVotes = useT("exitPoll.totalVotes", { count: tally.total });
  const empty = useT("exitPoll.empty");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !pickedParty || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await castVote(selectedKey, pickedParty, auth.uid);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMyVote(result.party);
      setTally(result.tally);
    } finally {
      setSubmitting(false);
    }
  };

  const credibleParties = selected ? getCredibleParties(selected.state) : [];
  const chartData = Object.entries(tally.byParty)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_PARTIES_LIMIT)
    .map(([party, count]) => ({ party, count, fill: getPartyColor(party) }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-muted">{subtitle}</p>
      </div>

      <div
        className={`rounded-xl border px-3 py-2 text-xs mb-6 ${
          backed
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/5 text-amber-300"
        }`}
      >
        {backed ? fbConnected : fbMissing}
      </div>

      <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs text-text/85 mb-3">
        {warning}
      </div>
      {backed && (
        <div className="rounded-xl border border-border bg-bg/40 px-4 py-2 text-xs text-muted mb-8">
          {identitySwitchWarn}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-4">
        <div>
          <label htmlFor="exit-poll-election" className="text-xs uppercase tracking-widest text-muted block mb-1">
            {pickElectionLabel}
          </label>
          <select
            id="exit-poll-election"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
          >
            {elections.map((e) => {
              const k = electionKey(e);
              const status = statusKey(e.status) === "exitPoll.statusCompleted" ? completedLabel : scheduledLabel;
              return (
                <option key={k} value={k}>
                  {labelFor(e)} — {status}
                </option>
              );
            })}
          </select>
          {selected && (
            <div className="mt-1 text-xs text-muted">{expectedWindowTpl}</div>
          )}
        </div>

        {myVote ? (
          <div className="rounded-lg border border-border bg-bg/50 px-3 py-2 text-sm">
            <span className="text-muted text-xs uppercase tracking-widest mr-2">{alreadyVoted}</span>
            <span
              className="font-mono font-semibold"
              style={{ color: getPartyColor(myVote) }}
            >
              {myVote}
            </span>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="exit-poll-party" className="text-xs uppercase tracking-widest text-muted block mb-1">
                {pickPartyLabel}
              </label>
              <select
                id="exit-poll-party"
                value={pickedParty}
                onChange={(e) => setPickedParty(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              >
                <option value="">—</option>
                {credibleParties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!pickedParty || !selectedKey || submitting || (backed && !auth.uid)}
              className="px-5 py-2 rounded-lg bg-accent text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {submit}
            </button>
            {error && <div className="text-xs text-red-400">{error}</div>}
          </>
        )}

        {backed && auth.uid && (
          <div className="text-[10px] text-muted font-mono pt-1 border-t border-border">
            {yourUid}: {auth.uid}
          </div>
        )}
      </form>

      <div
        className="bg-surface border border-border rounded-xl p-5"
        role="region"
        aria-label={tallyTitle}
        aria-live="polite"
      >
        <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display text-lg font-bold">{tallyTitle}</h2>
          <span className="text-xs text-muted">{totalVotes}</span>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted">{empty}</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="party"
                  width={80}
                  tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.party} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
