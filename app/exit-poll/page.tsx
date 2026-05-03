"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useT } from "@/lib/translation-runtime";
import { castVote, getMyVote, getTally, type ExitPollTally } from "@/lib/exit-poll-store";
import { getAllParties, getPartyColor } from "@/lib/data-utils";

const TOP_PARTIES_LIMIT = 10;

export default function ExitPollPage() {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [tally, setTally] = useState<ExitPollTally>({ total: 0, byParty: {} });
  const [pick, setPick] = useState("");
  const [error, setError] = useState<string | null>(null);

  const title = useT("exitPoll.title");
  const subtitle = useT("exitPoll.subtitle");
  const warning = useT("exitPoll.warning");
  const pickParty = useT("exitPoll.pickParty");
  const submit = useT("exitPoll.submit");
  const alreadyVoted = useT("exitPoll.alreadyVoted");
  const tallyTitle = useT("exitPoll.tallyTitle");
  const totalVotes = useT("exitPoll.totalVotes", { count: tally.total });
  const empty = useT("exitPoll.empty");

  useEffect(() => {
    setMyVote(getMyVote());
    setTally(getTally());
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return;
    const result = castVote(pick);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError(null);
    setMyVote(result.party);
    setTally(result.tally);
  };

  const parties = getAllParties().slice(0, 18);
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

      <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs text-text/85 mb-8">
        {warning}
      </div>

      {myVote ? (
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <div className="text-xs uppercase tracking-widest text-muted mb-1">
            {alreadyVoted}
          </div>
          <div className="font-display text-2xl font-bold">
            <span style={{ color: getPartyColor(myVote) }}>{myVote}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-3">
          <label className="text-xs uppercase tracking-widest text-muted">{pickParty}</label>
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">—</option>
            {parties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!pick}
            className="px-5 py-2 rounded-lg bg-accent text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submit}
          </button>
          {error && <div className="text-xs text-red-400">{error}</div>}
        </form>
      )}

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-bold">{tallyTitle}</h2>
          <span className="text-xs text-muted">{totalVotes}</span>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted">{empty}</p>
        ) : (
          <div className="h-64">
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
