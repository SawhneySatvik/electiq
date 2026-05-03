"use client";

import {
  doc,
  getDoc,
  increment,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebase, isFirebaseConfigured } from "./firebase";
import type { UpcomingElection } from "./types";

const EID_KEY = "electoiq-eid";
const VOTES_KEY = "electoiq-exit-poll-votes";
const TALLIES_KEY = "electoiq-exit-poll-tallies";

const VOTES_COLLECTION = "exit_poll_votes";
const TALLIES_COLLECTION = "exit_poll_tallies";

export interface ExitPollTally {
  total: number;
  byParty: Record<string, number>;
}

export type TallyMap = Record<string, ExitPollTally>;
export type VoteMap = Record<string, string>;

export function electionKey(e: Pick<UpcomingElection, "state" | "type" | "expected_year">): string {
  return `${e.state}::${e.type}::${e.expected_year}`;
}

export function isFirebaseBacked(): boolean {
  return isFirebaseConfigured();
}

// ---------- localStorage fallback ----------

function lsEnsureEid(): string {
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

function lsReadVotes(): VoteMap {
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

function lsWriteVotes(v: VoteMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOTES_KEY, JSON.stringify(v));
  } catch {}
}

function lsReadTallies(): TallyMap {
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

function lsWriteTallies(t: TallyMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALLIES_KEY, JSON.stringify(t));
  } catch {}
}

// ---------- Public API ----------

export async function getMyVote(key: string, uid: string | null): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) {
    lsEnsureEid();
    return lsReadVotes()[key] ?? null;
  }
  if (!uid) return null;
  const ref = doc(fb.db, VOTES_COLLECTION, `${uid}_${key}`);
  const snap = await getDoc(ref);
  return snap.exists() ? String((snap.data() as { party?: string }).party ?? "") : null;
}

export function subscribeTally(
  key: string,
  onChange: (tally: ExitPollTally) => void,
): () => void {
  const fb = getFirebase();
  if (!fb) {
    onChange(lsReadTallies()[key] ?? { total: 0, byParty: {} });
    return () => {};
  }
  const ref = doc(fb.db, TALLIES_COLLECTION, key);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange({ total: 0, byParty: {} });
        return;
      }
      const data = snap.data() as { total?: number; byParty?: Record<string, number> };
      onChange({ total: Number(data.total ?? 0), byParty: data.byParty ?? {} });
    },
    () => onChange({ total: 0, byParty: {} }),
  );
}

export async function getAllMyVotes(uid: string | null): Promise<VoteMap> {
  const fb = getFirebase();
  if (!fb) {
    lsEnsureEid();
    return lsReadVotes();
  }
  // Firestore: would require a query by uid prefix or a per-user doc.
  // For demo scale, we don't show this list when Firebase-backed (it's a UX nicety only).
  // Return empty until a future enhancement (e.g. per-user index doc).
  if (!uid) return {};
  return {};
}

export async function castVote(
  key: string,
  party: string,
  uid: string | null,
): Promise<{ ok: true; party: string; tally: ExitPollTally } | { ok: false; error: string }> {
  const fb = getFirebase();
  if (!fb) {
    if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
    if (!key) return { ok: false, error: "Pick an election" };
    if (!party) return { ok: false, error: "Pick a party" };
    lsEnsureEid();
    const votes = lsReadVotes();
    if (votes[key]) {
      return { ok: false, error: "You have already voted in this election on this device." };
    }
    const tallies = lsReadTallies();
    const current = tallies[key] ?? { total: 0, byParty: {} };
    current.byParty[party] = (current.byParty[party] ?? 0) + 1;
    current.total += 1;
    tallies[key] = current;
    votes[key] = party;
    lsWriteTallies(tallies);
    lsWriteVotes(votes);
    return { ok: true, party, tally: current };
  }

  if (!key) return { ok: false, error: "Pick an election" };
  if (!party) return { ok: false, error: "Pick a party" };
  if (!uid) return { ok: false, error: "Auth not ready" };

  const voteRef = doc(fb.db, VOTES_COLLECTION, `${uid}_${key}`);
  const tallyRef = doc(fb.db, TALLIES_COLLECTION, key);
  try {
    await runTransaction(fb.db, async (tx) => {
      const existing = await tx.get(voteRef);
      if (existing.exists()) {
        throw new Error("ALREADY_VOTED");
      }
      const tallySnap = await tx.get(tallyRef);
      tx.set(voteRef, {
        uid,
        electionKey: key,
        party,
        createdAt: serverTimestamp(),
      });
      if (tallySnap.exists()) {
        tx.update(tallyRef, {
          total: increment(1),
          [`byParty.${party}`]: increment(1),
        });
      } else {
        tx.set(tallyRef, {
          total: 1,
          byParty: { [party]: 1 },
        });
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "ALREADY_VOTED") {
      return { ok: false, error: "You have already voted in this election under this Firebase user." };
    }
    return { ok: false, error: message };
  }
  // Read the freshly-updated tally for return.
  const after = await getDoc(tallyRef);
  const data = after.exists()
    ? (after.data() as { total?: number; byParty?: Record<string, number> })
    : { total: 0, byParty: {} };
  return {
    ok: true,
    party,
    tally: { total: Number(data.total ?? 0), byParty: data.byParty ?? {} },
  };
}
