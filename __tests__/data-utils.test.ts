import { describe, expect, it } from "vitest";
import {
  formatAssets,
  formatVotes,
  getAllParties,
  getAllStates,
  getAllYears,
  getCandidateById,
  getConstituenciesForState,
  getConstituencyById,
  getCredibleParties,
  getDominantPartyByState,
  getNextElections,
  getPartyColor,
  getRajyaSabhaForState,
  getSeatProfile,
  getUpcomingElections,
  retrieveRelevantContext,
  searchCandidates,
  searchConstituencies,
} from "@/lib/data-utils";

describe("formatAssets", () => {
  it("returns lakhs for sub-100 values", () => {
    expect(formatAssets(50)).toBe("₹50.0 L");
  });

  it("returns crores once value crosses 100 lakhs", () => {
    expect(formatAssets(150)).toBe("₹1.50 Cr");
  });

  it("uses one decimal for >=10 Cr", () => {
    expect(formatAssets(1500)).toBe("₹15.0 Cr");
  });

  it("switches to thousand-crore when value crosses 100000 lakhs", () => {
    expect(formatAssets(150000)).toBe("₹1.50 K Cr");
  });

  it("treats NaN as missing", () => {
    expect(formatAssets(Number.NaN)).toBe("—");
  });

  it("preserves zero as 0 lakhs (not the missing sentinel)", () => {
    expect(formatAssets(0)).toBe("₹0.0 L");
  });
});

describe("formatVotes", () => {
  it("uses lakh suffix above 1L", () => {
    expect(formatVotes(150000)).toBe("1.50 L");
  });

  it("uses K suffix in the 1k-99k range", () => {
    expect(formatVotes(1500)).toBe("1.5 K");
  });

  it("returns the raw count for sub-1000 values", () => {
    expect(formatVotes(150)).toBe("150");
  });
});

describe("getPartyColor", () => {
  it("returns the brand colour for known parties", () => {
    expect(getPartyColor("BJP")).toBe("#f97316");
    expect(getPartyColor("INC")).toBe("#2563eb");
    expect(getPartyColor("BJD")).toBe("#0d9488");
  });

  it("falls back to neutral grey for unknown parties", () => {
    expect(getPartyColor("UNKNOWN_PARTY_X")).toBe("#71717a");
  });
});

describe("dataset coverage helpers", () => {
  it("getAllStates returns a sorted superset spanning LS + VS data", () => {
    const states = getAllStates();
    expect(states.length).toBeGreaterThan(15);
    expect(states).toEqual([...states].sort());
    expect(states).toContain("Maharashtra");
    expect(states).toContain("Tamil Nadu");
    expect(states).toContain("Madhya Pradesh");
  });

  it("getAllYears returns descending years covering at least 2009-2024", () => {
    const years = getAllYears();
    expect(years[0]).toBeGreaterThanOrEqual(years[years.length - 1]);
    expect(years).toContain(2009);
    expect(years).toContain(2024);
  });

  it("getAllParties strips placeholder dashes and dedupes", () => {
    const parties = getAllParties();
    expect(parties).not.toContain("—");
    expect(new Set(parties).size).toBe(parties.length);
    expect(parties).toContain("BJP");
  });
});

describe("getConstituenciesForState", () => {
  it("returns LS seats for a state with the lastResult metadata attached", () => {
    const seats = getConstituenciesForState("Maharashtra", "LS");
    expect(seats.length).toBeGreaterThan(0);
    for (const s of seats) {
      expect(s.state).toBe("Maharashtra");
      expect(s.type).toBe("LS");
      expect(s.lastResult).toBeDefined();
    }
  });

  it("returns VS rows from the most recent assembly election", () => {
    const seats = getConstituenciesForState("Tamil Nadu", "VS");
    expect(seats.length).toBeGreaterThan(0);
    for (const s of seats) {
      expect(s.state).toBe("Tamil Nadu");
      expect(s.type).toBe("VS");
    }
  });

  it("returns empty for a state without VS data", () => {
    expect(getConstituenciesForState("Goa", "VS")).toHaveLength(0);
  });
});

describe("getConstituencyById", () => {
  it("finds an LS seat by id", () => {
    const r = getConstituencyById("mh-mumbai-north");
    if (!r) throw new Error("expected mh-mumbai-north to resolve");
    expect(r.type).toBe("LS");
    if (r.type === "LS") {
      expect(r.data.name).toBe("Mumbai North");
    }
  });

  it("returns undefined for an unknown id", () => {
    expect(getConstituencyById("xx-nowhere")).toBeUndefined();
  });
});

describe("searchCandidates", () => {
  it("filters by state when state filter is set", () => {
    const result = searchCandidates("", {
      state: "Maharashtra",
      party: "ALL",
      year: null,
      electionType: "ALL",
    });
    for (const c of result) expect(c.state).toBe("Maharashtra");
  });

  it("ignores ALL placeholders and falls back to query-only matching", () => {
    const result = searchCandidates("BJP", {
      state: "ALL",
      party: "ALL",
      year: null,
      electionType: "ALL",
    });
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("searchConstituencies", () => {
  it("matches on the constituency name", () => {
    const result = searchConstituencies("Pune");
    expect(result.some((c) => c.name === "Pune")).toBe(true);
  });

  it("respects an optional state filter", () => {
    const result = searchConstituencies("", "Karnataka");
    for (const c of result) expect(c.state).toBe("Karnataka");
  });
});

describe("getCandidateById", () => {
  it("finds a known candidate", () => {
    const all = searchCandidates("", {
      state: "ALL",
      party: "ALL",
      year: null,
      electionType: "ALL",
    });
    expect(all.length).toBeGreaterThan(0);
    const c = getCandidateById(all[0].id);
    expect(c).toBeDefined();
    expect(c!.id).toBe(all[0].id);
  });

  it("returns undefined for an unknown id", () => {
    expect(getCandidateById("does-not-exist")).toBeUndefined();
  });
});

describe("getDominantPartyByState", () => {
  it("returns a populated map keyed by states with LS data", () => {
    const map = getDominantPartyByState();
    expect(Object.keys(map).length).toBeGreaterThan(10);
    expect(map.Maharashtra).toBeDefined();
    expect(map["Tamil Nadu"]).toBeDefined();
  });

  it("picks a party present in the LS dataset for each entry", () => {
    const map = getDominantPartyByState();
    const allParties = new Set(getAllParties());
    for (const party of Object.values(map)) {
      expect(allParties.has(party)).toBe(true);
    }
  });
});

describe("getCredibleParties", () => {
  it("returns the curated national set for All India", () => {
    const parties = getCredibleParties("All India");
    expect(parties).toContain("BJP");
    expect(parties).toContain("INC");
    expect(parties).toContain("BJD");
  });

  it("derives state-specific parties from real LS/VS/RS history", () => {
    const mhParties = getCredibleParties("Maharashtra");
    expect(mhParties).toContain("BJP");
    expect(mhParties).toContain("SS");
    expect(mhParties).toContain("NCP");
  });

  it("excludes the placeholder dash sentinel", () => {
    expect(getCredibleParties("Maharashtra")).not.toContain("—");
  });

  it("returns a sorted array", () => {
    const parties = getCredibleParties("Karnataka");
    expect(parties).toEqual([...parties].sort());
  });
});

describe("getNextElections", () => {
  it("filters out completed polls and respects the limit", () => {
    const next = getNextElections(3);
    expect(next.length).toBeLessThanOrEqual(3);
    for (const e of next) {
      expect(e.status).not.toBe("polling completed");
    }
  });

  it("returns events sorted ascending by year", () => {
    const next = getNextElections(5);
    for (let i = 1; i < next.length; i++) {
      expect(next[i].expected_year).toBeGreaterThanOrEqual(next[i - 1].expected_year);
    }
  });

  it("includes scheduled All India LS event when present", () => {
    const all = getUpcomingElections();
    const hasAllIndia = all.some((e) => e.state === "All India" && e.type === "LS");
    expect(hasAllIndia).toBe(true);
  });
});

describe("getRajyaSabhaForState", () => {
  it("returns a roster for a covered state", () => {
    const r = getRajyaSabhaForState("Maharashtra");
    expect(r).toBeDefined();
    expect(r!.members.length).toBeGreaterThan(0);
  });

  it("returns undefined for a state with no roster", () => {
    expect(getRajyaSabhaForState("Nowhere")).toBeUndefined();
  });
});

describe("getSeatProfile", () => {
  it("returns a profile for a curated seat", () => {
    const p = getSeatProfile("up-varanasi");
    expect(p).toBeDefined();
    expect(p!.electors_recent).toBeGreaterThan(0);
    expect(p!.literacy_rate_pct).toBeGreaterThan(0);
  });

  it("returns undefined for a seat without a curated profile", () => {
    expect(getSeatProfile("ga-south-goa")).toBeUndefined();
  });
});

describe("retrieveRelevantContext", () => {
  it("surfaces a constituency record when the user names the seat and year", () => {
    const ctx = retrieveRelevantContext("Who won Mumbai North in 2019?", 10);
    expect(ctx.length).toBeGreaterThan(0);
    expect(
      ctx.some((c) => c.type === "constituency" && c.label.includes("Mumbai North")),
    ).toBe(true);
  });

  it("boosts candidate records for richest queries with a state hint", () => {
    const ctx = retrieveRelevantContext("Show me the richest candidates in Karnataka", 10);
    expect(ctx.some((c) => c.type === "candidate")).toBe(true);
  });

  it("surfaces upcoming-election records for schedule questions", () => {
    const ctx = retrieveRelevantContext("when is the next Bihar election", 10);
    expect(ctx.some((c) => c.type === "upcoming")).toBe(true);
  });

  it("surfaces Rajya Sabha records for upper-house questions", () => {
    const ctx = retrieveRelevantContext("Karnataka Rajya Sabha members", 10);
    expect(ctx.some((c) => c.type === "rajya_sabha")).toBe(true);
  });

  it("merges seat profile into LS context when a profile question hits", () => {
    const ctx = retrieveRelevantContext("varanasi population and history", 10);
    const cRec = ctx.find((c) => c.id === "up-varanasi");
    expect(cRec).toBeDefined();
    if (cRec) {
      const data = cRec.data as { profile?: unknown };
      expect(data.profile).toBeDefined();
    }
  });

  it("respects the maxRecords cap", () => {
    const ctx = retrieveRelevantContext("BJP", 3);
    expect(ctx.length).toBeLessThanOrEqual(3);
  });
});
