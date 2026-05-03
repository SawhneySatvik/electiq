"use client";

import type { UpcomingElection } from "./types";

const EID_KEY = "electoiq-eid";
const VOTES_KEY = "electoiq-exit-poll-votes";
const TALLIES_KEY = "electoiq-exit-poll-tallies";

export interface ExitPollTally {
  total: number;
  byParty: Record<string, number>;
}

export type TallyMap = Record<string, ExitPollTally>;
export type VoteMap = Record<string, string>;

export function electionKey(e: Pick<UpcomingElection, "state" | "type" | "expected_year">): string {
  return `${e.state}::${e.type}::${e.expected_year}`;
}

function ensureEid(): string {
  if (typeof window === "undefined") return "anon";
  let eid = window.localStorage.getItem(EID_KEY);
  if (!eid) {
    eid = `e-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    try {
      window.localStorage.setItem(EID_KEY, eid);
    } catch {}
  }
  return eid;
}

function readVotes(): VoteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as VoteMap) : {};
  } catch {
    return {};
  }
}

function writeVotes(v: VoteMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOTES_KEY, JSON.stringify(v));
  } catch {}
}

function readTallies(): TallyMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TALLIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as TallyMap) : {};
  } catch {
    return {};
  }
}

function writeTallies(t: TallyMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALLIES_KEY, JSON.stringify(t));
  } catch {}
}

export function getMyVote(key: string): string | null {
  if (typeof window === "undefined") return null;
  ensureEid();
  return readVotes()[key] ?? null;
}

export function getAllMyVotes(): VoteMap {
  if (typeof window === "undefined") return {};
  ensureEid();
  return readVotes();
}

export function getTally(key: string): ExitPollTally {
  return readTallies()[key] ?? { total: 0, byParty: {} };
}

export function getAllTallies(): TallyMap {
  return readTallies();
}

export function castVote(
  key: string,
  party: string,
):
  | { ok: true; party: string; tally: ExitPollTally }
  | { ok: false; error: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  if (!key) return { ok: false, error: "Pick an election" };
  if (!party) return { ok: false, error: "Pick a party" };
  ensureEid();
  const votes = readVotes();
  if (votes[key]) {
    return { ok: false, error: "You have already voted in this election on this device." };
  }
  const tallies = readTallies();
  const current = tallies[key] ?? { total: 0, byParty: {} };
  current.byParty[party] = (current.byParty[party] ?? 0) + 1;
  current.total += 1;
  tallies[key] = current;
  votes[key] = party;
  writeTallies(tallies);
  writeVotes(votes);
  return { ok: true, party, tally: current };
}
