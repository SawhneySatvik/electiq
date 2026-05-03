"use client";

const EID_KEY = "electoiq-eid";
const VOTE_KEY = "electoiq-exit-poll-vote";
const TALLY_KEY = "electoiq-exit-poll-tally";

export interface ExitPollTally {
  total: number;
  byParty: Record<string, number>;
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

export function getMyVote(): string | null {
  if (typeof window === "undefined") return null;
  ensureEid();
  return window.localStorage.getItem(VOTE_KEY);
}

export function castVote(party: string): { party: string; tally: ExitPollTally } | { error: string } {
  if (typeof window === "undefined") return { error: "Not in browser" };
  if (!party) return { error: "Pick a party" };
  ensureEid();
  if (window.localStorage.getItem(VOTE_KEY)) {
    return { error: "You have already voted on this device. Clear localStorage to revote." };
  }
  const tally = readTally();
  tally.byParty[party] = (tally.byParty[party] ?? 0) + 1;
  tally.total += 1;
  writeTally(tally);
  try {
    window.localStorage.setItem(VOTE_KEY, party);
  } catch {}
  return { party, tally };
}

export function getTally(): ExitPollTally {
  return readTally();
}

function readTally(): ExitPollTally {
  if (typeof window === "undefined") return { total: 0, byParty: {} };
  try {
    const raw = window.localStorage.getItem(TALLY_KEY);
    if (!raw) return { total: 0, byParty: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { total: 0, byParty: {} };
    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      byParty: typeof parsed.byParty === "object" && parsed.byParty ? parsed.byParty : {},
    };
  } catch {
    return { total: 0, byParty: {} };
  }
}

function writeTally(t: ExitPollTally): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALLY_KEY, JSON.stringify(t));
  } catch {}
}
