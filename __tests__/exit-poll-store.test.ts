import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  castVote,
  electionKey,
  getAllMyVotes,
  getMyVote,
  subscribeTally,
  type ExitPollTally,
} from "@/lib/exit-poll-store";

const sampleElection = {
  state: "Maharashtra",
  type: "VS" as const,
  expected_year: 2029,
};

describe("electionKey", () => {
  it("formats state::type::year", () => {
    expect(electionKey(sampleElection)).toBe("Maharashtra::VS::2029");
  });

  it("preserves multi-word state names", () => {
    expect(
      electionKey({ state: "Tamil Nadu", type: "VS", expected_year: 2031 }),
    ).toBe("Tamil Nadu::VS::2031");
  });

  it("differs by year and by type", () => {
    expect(
      electionKey({ state: "Bihar", type: "VS", expected_year: 2025 }),
    ).not.toBe(electionKey({ state: "Bihar", type: "VS", expected_year: 2030 }));
    expect(
      electionKey({ state: "All India", type: "LS", expected_year: 2029 }),
    ).not.toBe(electionKey({ state: "All India", type: "VS", expected_year: 2029 }));
  });
});

describe("castVote / getMyVote (localStorage fallback)", () => {
  beforeEach(() => {
    // happy-dom provides localStorage; clear before each test.
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("rejects an empty election key", async () => {
    const r = await castVote("", "BJP", null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/election/i);
  });

  it("rejects an empty party", async () => {
    const r = await castVote(electionKey(sampleElection), "", null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/party/i);
  });

  it("records the first vote and returns the new tally", async () => {
    const key = electionKey(sampleElection);
    const r = await castVote(key, "BJP", null);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.party).toBe("BJP");
      expect(r.tally.total).toBe(1);
      expect(r.tally.byParty.BJP).toBe(1);
    }
  });

  it("rejects double-voting on the same election from the same browser", async () => {
    const key = electionKey(sampleElection);
    await castVote(key, "BJP", null);
    const second = await castVote(key, "INC", null);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toMatch(/already voted/i);
  });

  it("getMyVote reflects the cast vote on the same browser", async () => {
    const key = electionKey(sampleElection);
    expect(await getMyVote(key, null)).toBeNull();
    await castVote(key, "SS", null);
    expect(await getMyVote(key, null)).toBe("SS");
  });

  it("allows a vote in a different election even if one is already cast", async () => {
    const k1 = electionKey({ state: "Bihar", type: "VS", expected_year: 2030 });
    const k2 = electionKey({ state: "All India", type: "LS", expected_year: 2029 });
    const r1 = await castVote(k1, "RJD", null);
    const r2 = await castVote(k2, "BJP", null);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });

  it("getAllMyVotes returns each cast vote keyed by election", async () => {
    const k1 = electionKey({ state: "Bihar", type: "VS", expected_year: 2030 });
    const k2 = electionKey({ state: "All India", type: "LS", expected_year: 2029 });
    await castVote(k1, "RJD", null);
    await castVote(k2, "BJP", null);
    const all = await getAllMyVotes(null);
    expect(all[k1]).toBe("RJD");
    expect(all[k2]).toBe("BJP");
  });
});

describe("subscribeTally (localStorage fallback)", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("emits an empty tally synchronously and the unsubscribe is a no-op", () => {
    const key = electionKey(sampleElection);
    const received: ExitPollTally[] = [];
    const unsub = subscribeTally(key, (t) => received.push(t));
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ total: 0, byParty: {} });
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("emits the persisted tally for a key with prior votes", async () => {
    const key = electionKey(sampleElection);
    await castVote(key, "BJP", null);
    await castVote(key, "BJP", null).catch(() => undefined); // already-voted, ignored
    const received: ExitPollTally[] = [];
    subscribeTally(key, (t) => received.push(t));
    expect(received[0].total).toBe(1);
    expect(received[0].byParty.BJP).toBe(1);
  });
});
