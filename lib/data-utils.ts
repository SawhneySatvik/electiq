import lokSabhaJson from "@/data/lok_sabha.json";
import stateElectionsJson from "@/data/state_elections.json";
import candidatesJson from "@/data/candidates.json";
import rajyaSabhaJson from "@/data/rajya_sabha.json";
import upcomingElectionsJson from "@/data/upcoming_elections.json";
import seatProfilesJson from "@/data/seat_profiles.json";
import type {
  LSConstituency,
  StateElection,
  Candidate,
  CandidateFilters,
  ChatContextRecord,
  VSResult,
  RajyaSabhaState,
  UpcomingElection,
  ConstituencyProfile,
} from "./types";

/** Every Lok Sabha constituency in the dataset (135 across 31 states/UTs × 4 cycles). */
export function getLokSabhaData(): LSConstituency[] {
  return (lokSabhaJson as { constituencies: LSConstituency[] }).constituencies;
}

/** Every Vidhan Sabha state-election record in the dataset (135 records across 15 assemblies). */
export function getStateElectionData(): StateElection[] {
  return (stateElectionsJson as { state_elections: StateElection[] }).state_elections;
}

/** Every candidate-affidavit record in the dataset (78 records). */
export function getCandidatesData(): Candidate[] {
  return (candidatesJson as { candidates: Candidate[] }).candidates;
}

/** Rajya Sabha rosters keyed by state (28 states). */
export function getRajyaSabhaData(): RajyaSabhaState[] {
  return (rajyaSabhaJson as { rajya_sabha: RajyaSabhaState[] }).rajya_sabha;
}

/** Curated profile for a specific LS seat, or `undefined` if not loaded. */
export function getSeatProfile(id: string): ConstituencyProfile | undefined {
  const profiles = (seatProfilesJson as { profiles: Record<string, ConstituencyProfile> }).profiles;
  return profiles[id];
}

/** All seat ids that have a curated profile loaded. */
export function getAllSeatProfileIds(): string[] {
  return Object.keys((seatProfilesJson as { profiles: Record<string, ConstituencyProfile> }).profiles);
}

/** Rajya Sabha roster for a single state, or `undefined` if not loaded. */
export function getRajyaSabhaForState(state: string): RajyaSabhaState | undefined {
  return getRajyaSabhaData().find((r) => r.state === state);
}

/** Full schedule of upcoming and recently-completed elections. */
export function getUpcomingElections(): UpcomingElection[] {
  return (upcomingElectionsJson as { elections: UpcomingElection[] }).elections;
}

/** ISO month string (`YYYY-MM`) reflecting when the schedule data was curated. */
export function getUpcomingElectionsAsOf(): string {
  return (upcomingElectionsJson as { as_of?: string }).as_of ?? "";
}

/**
 * Next `limit` not-yet-polled elections, sorted ascending by year. Used by the
 * home page's upcoming-elections strip.
 */
export function getNextElections(limit = 3): UpcomingElection[] {
  return [...getUpcomingElections()]
    .filter((e) => e.status !== "polling completed")
    .sort((a, b) => a.expected_year - b.expected_year)
    .slice(0, limit);
}

const NATIONAL_PARTIES = [
  "BJP",
  "INC",
  "AAP",
  "TMC",
  "SP",
  "BSP",
  "DMK",
  "AIADMK",
  "NCP",
  "SS",
  "BRS",
  "YSRCP",
  "TDP",
  "JD(U)",
  "RJD",
  "BJD",
  "CPI(M)",
  "CPI",
  "AIMIM",
];

/**
 * Returns parties credibly associated with a state — derived from real LS / VS
 * winners + runners-up + RS members for that state. For "All India", returns
 * a curated national list.
 *
 * Used by the exit poll's party dropdown to keep choices realistic per state.
 */
export function getCredibleParties(state: string): string[] {
  if (state === "All India") return [...NATIONAL_PARTIES];
  const set = new Set<string>();
  for (const c of getLokSabhaData()) {
    if (c.state !== state) continue;
    for (const r of c.results) {
      if (r.party) set.add(r.party);
      if (r.runner_up_party) set.add(r.runner_up_party);
    }
  }
  for (const se of getStateElectionData()) {
    if (se.state !== state) continue;
    for (const e of se.elections) {
      for (const c of e.constituencies) {
        if (c.party) set.add(c.party);
        if (c.runner_up_party) set.add(c.runner_up_party);
      }
    }
  }
  for (const r of getRajyaSabhaData()) {
    if (r.state !== state) continue;
    for (const m of r.members) {
      if (m.party) set.add(m.party);
    }
  }
  set.delete("—");
  return Array.from(set).sort();
}

/**
 * For each state with LS data, returns the party that won the most seats in
 * the most-recent election year. Used to colour the choropleth map.
 */
export function getDominantPartyByState(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of getLokSabhaData()) {
    const last = [...c.results].sort((a, b) => b.year - a.year)[0];
    if (!last) continue;
    out[c.state] = out[c.state] ?? "";
  }
  for (const state of Object.keys(out)) {
    const seats = getLokSabhaData().filter((c) => c.state === state);
    const latestYear = Math.max(
      ...seats.flatMap((s) => s.results.map((r) => r.year)),
    );
    const counts: Record<string, number> = {};
    for (const s of seats) {
      const r = s.results.find((rr) => rr.year === latestYear);
      if (r) counts[r.party] = (counts[r.party] ?? 0) + 1;
    }
    let best = "";
    let bestCount = -1;
    for (const [party, n] of Object.entries(counts)) {
      if (n > bestCount) {
        best = party;
        bestCount = n;
      }
    }
    out[state] = best;
  }
  return out;
}

export function getAllStates(): string[] {
  const ls = new Set(getLokSabhaData().map((c) => c.state));
  for (const se of getStateElectionData()) ls.add(se.state);
  return Array.from(ls).sort();
}

export function getAllParties(): string[] {
  const set = new Set<string>();
  for (const c of getLokSabhaData())
    for (const r of c.results) {
      if (r.party) set.add(r.party);
      if (r.runner_up_party) set.add(r.runner_up_party);
    }
  for (const se of getStateElectionData())
    for (const e of se.elections)
      for (const r of e.constituencies) {
        if (r.party) set.add(r.party);
        if (r.runner_up_party) set.add(r.runner_up_party);
      }
  for (const c of getCandidatesData()) if (c.party) set.add(c.party);
  return Array.from(set).filter((p) => p && p !== "—").sort();
}

export function getAllYears(): number[] {
  const years = new Set<number>();
  for (const c of getLokSabhaData())
    for (const r of c.results) years.add(r.year);
  for (const se of getStateElectionData())
    for (const e of se.elections) years.add(e.year);
  return Array.from(years).sort((a, b) => b - a);
}

export function getConstituenciesForState(state: string, electionType: "LS" | "VS"): {
  type: "LS" | "VS";
  id: string;
  name: string;
  state: string;
  lastResult?: { year: number; winner: string; party: string; margin: number };
}[] {
  if (electionType === "LS") {
    return getLokSabhaData()
      .filter((c) => c.state === state)
      .map((c) => {
        const last = [...c.results].sort((a, b) => b.year - a.year)[0];
        return {
          type: "LS" as const,
          id: c.id,
          name: c.name,
          state: c.state,
          lastResult: last
            ? { year: last.year, winner: last.winner, party: last.party, margin: last.margin }
            : undefined,
        };
      });
  }
  const out: ReturnType<typeof getConstituenciesForState> = [];
  const se = getStateElectionData().find((s) => s.state === state);
  if (!se) return out;
  for (const election of se.elections) {
    for (const c of election.constituencies) {
      out.push({
        type: "VS",
        id: c.id,
        name: c.name,
        state,
        lastResult: { year: election.year, winner: c.winner, party: c.party, margin: c.margin },
      });
    }
  }
  return out;
}

export function getConstituencyById(
  id: string,
):
  | { type: "LS"; data: LSConstituency }
  | { type: "VS"; data: VSResult & { state: string; year: number } }
  | undefined {
  const ls = getLokSabhaData().find((c) => c.id === id);
  if (ls) return { type: "LS", data: ls };
  for (const se of getStateElectionData())
    for (const e of se.elections)
      for (const c of e.constituencies)
        if (c.id === id)
          return { type: "VS", data: { ...c, state: se.state, year: e.year } };
  return undefined;
}

export function searchConstituencies(query: string, state?: string): LSConstituency[] {
  const q = query.trim().toLowerCase();
  return getLokSabhaData().filter((c) => {
    if (state && c.state !== state) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q);
  });
}

export function searchCandidates(query: string, filters: CandidateFilters): Candidate[] {
  const q = query.trim().toLowerCase();
  return getCandidatesData().filter((c) => {
    if (filters.state && filters.state !== "ALL" && c.state !== filters.state) return false;
    if (filters.party && filters.party !== "ALL" && c.party !== filters.party) return false;
    if (filters.year && c.year !== filters.year) return false;
    if (filters.electionType && filters.electionType !== "ALL" && c.election_type !== filters.electionType)
      return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.constituency.toLowerCase().includes(q) ||
      c.party.toLowerCase().includes(q)
    );
  });
}

export function getCandidateById(id: string): Candidate | undefined {
  return getCandidatesData().find((c) => c.id === id);
}

export function getCandidatesByConstituency(constituencyId: string): Candidate[] {
  return getCandidatesData().filter((c) => c.constituency_id === constituencyId);
}

const STATE_ALIASES: Record<string, string> = {
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  nagpur: "Maharashtra",
  chennai: "Tamil Nadu",
  madras: "Tamil Nadu",
  bangalore: "Karnataka",
  bengaluru: "Karnataka",
  mysore: "Karnataka",
  mysuru: "Karnataka",
  kolkata: "West Bengal",
  calcutta: "West Bengal",
  bengal: "West Bengal",
  delhi: "Delhi",
  ncr: "Delhi",
  jaipur: "Rajasthan",
  rajasthan: "Rajasthan",
  gujarat: "Gujarat",
  ahmedabad: "Gujarat",
  surat: "Gujarat",
  patna: "Bihar",
  bihar: "Bihar",
  hyderabad: "Andhra Pradesh",
  andhra: "Andhra Pradesh",
  vijayawada: "Andhra Pradesh",
  kerala: "Kerala",
  trivandrum: "Kerala",
  thiruvananthapuram: "Kerala",
  punjab: "Punjab",
  amritsar: "Punjab",
  ludhiana: "Punjab",
  up: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  varanasi: "Uttar Pradesh",
  banaras: "Uttar Pradesh",
  tn: "Tamil Nadu",
  mh: "Maharashtra",
  ka: "Karnataka",
  kl: "Kerala",
  ap: "Andhra Pradesh",
  pb: "Punjab",
  rj: "Rajasthan",
  gj: "Gujarat",
  br: "Bihar",
  wb: "West Bengal",
  dl: "Delhi",
};

/**
 * Keyword-scoring RAG retriever. Extracts state/party/year mentions from the
 * user message, scores every LS / VS / candidate / RS / upcoming-election
 * record against the question, and returns the top `maxRecords` matches.
 *
 * Used by `/api/chat` to ground Gemini responses in the dataset. Profile
 * questions ("population", "violence", "demographics") merge the seat profile
 * into the constituency record so the model has structured numbers to cite.
 */
export function retrieveRelevantContext(userMessage: string, maxRecords = 10): ChatContextRecord[] {
  const msg = userMessage.toLowerCase();
  const tokens = msg.split(/[^a-z0-9()]+/).filter((t) => t.length >= 2);

  const yearMatches = Array.from(msg.matchAll(/\b(20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
  const targetStates = new Set<string>();
  const allStates = getAllStates();
  for (const s of allStates) {
    if (msg.includes(s.toLowerCase())) targetStates.add(s);
  }
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (msg.includes(alias)) targetStates.add(state);
  }

  const allParties = getAllParties();
  const targetParties = new Set<string>();
  for (const p of allParties) {
    if (msg.includes(p.toLowerCase())) targetParties.add(p);
  }

  const richestKeywords = ["rich", "richest", "wealth", "wealthy", "asset", "crorepati"];
  const wantsRichest = richestKeywords.some((k) => msg.includes(k));
  const criminalKeywords = ["crimin", "case", "convict", "charge"];
  const wantsCriminal = criminalKeywords.some((k) => msg.includes(k));

  const scored: { rec: ChatContextRecord; score: number }[] = [];

  const profileIntent = ["population", "demograph", "communit", "literac", "violen", "riot", "issue", "history", "histor"];
  const wantsProfile = profileIntent.some((k) => msg.includes(k));

  for (const c of getLokSabhaData()) {
    let score = 0;
    if (msg.includes(c.name.toLowerCase())) score += 10;
    if (targetStates.has(c.state)) score += 3;
    for (const r of c.results) {
      if (msg.includes(r.winner.toLowerCase())) score += 8;
      if (msg.includes(r.runner_up.toLowerCase())) score += 4;
      if (yearMatches.includes(r.year)) score += 2;
      if (targetParties.has(r.party)) score += 1;
    }
    for (const t of tokens) {
      if (c.name.toLowerCase().split(/\s+/).includes(t)) score += 2;
    }
    const profile = getSeatProfile(c.id);
    if (profile && wantsProfile) score += 4;
    if (score > 0) {
      scored.push({
        rec: {
          type: "constituency",
          id: c.id,
          label: `${c.name} (${c.state})`,
          data: profile ? { ...c, profile } : c,
        },
        score,
      });
    }
  }

  for (const se of getStateElectionData()) {
    for (const e of se.elections) {
      for (const c of e.constituencies) {
        let score = 0;
        if (msg.includes(c.name.toLowerCase())) score += 8;
        if (targetStates.has(se.state)) score += 2;
        if (yearMatches.includes(e.year)) score += 2;
        if (msg.includes(c.winner.toLowerCase())) score += 8;
        if (msg.includes(c.runner_up.toLowerCase())) score += 4;
        if (targetParties.has(c.party)) score += 1;
        if (score > 0) {
          scored.push({
            rec: {
              type: "vs_constituency",
              id: c.id,
              label: `${c.name} VS ${e.year} (${se.state})`,
              data: { ...c, state: se.state, year: e.year },
            },
            score,
          });
        }
      }
    }
  }

  for (const cand of getCandidatesData()) {
    let score = 0;
    if (msg.includes(cand.name.toLowerCase())) score += 10;
    if (targetStates.has(cand.state)) score += 2;
    if (msg.includes(cand.constituency.toLowerCase())) score += 6;
    if (yearMatches.includes(cand.year)) score += 1;
    if (targetParties.has(cand.party)) score += 2;
    if (wantsRichest) score += Math.min(6, cand.total_assets_lakhs / 5000);
    if (wantsCriminal && cand.criminal_cases > 0) score += 4;
    if (score > 0) {
      scored.push({
        rec: { type: "candidate", id: cand.id, label: `${cand.name} (${cand.party}, ${cand.year})`, data: cand },
        score,
      });
    }
  }

  const rsKeywords = ["rajya sabha", "upper house", "council of states", "rs mp", "rs member"];
  const wantsRS = rsKeywords.some((k) => msg.includes(k));
  for (const rs of getRajyaSabhaData()) {
    let score = 0;
    if (targetStates.has(rs.state)) score += 4;
    if (wantsRS) score += 5;
    for (const m of rs.members) {
      if (msg.includes(m.name.toLowerCase())) score += 8;
      if (targetParties.has(m.party)) score += 1;
    }
    if (score > 0) {
      scored.push({
        rec: {
          type: "rajya_sabha",
          id: `rs-${rs.state.toLowerCase().replace(/\s+/g, "-")}`,
          label: `Rajya Sabha — ${rs.state}`,
          data: rs,
        },
        score,
      });
    }
  }

  const scheduleKeywords = ["upcoming", "next election", "schedule", "when is", "when will", "term ends"];
  const wantsSchedule = scheduleKeywords.some((k) => msg.includes(k));
  for (const ue of getUpcomingElections()) {
    let score = 0;
    if (wantsSchedule) score += 3;
    if (targetStates.has(ue.state)) score += 4;
    if (yearMatches.includes(ue.expected_year)) score += 2;
    if (msg.includes(ue.state.toLowerCase())) score += 3;
    if (score > 0) {
      scored.push({
        rec: {
          type: "upcoming",
          id: `ue-${ue.state.toLowerCase().replace(/\s+/g, "-")}-${ue.expected_year}-${ue.type}`,
          label: `${ue.state} ${ue.type} ${ue.expected_year}`,
          data: ue,
        },
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxRecords).map((s) => s.rec);
}

/** Format a Rupee amount given in lakhs. Returns "—" when the value is missing. */
export function formatAssets(lakhs: number): string {
  if (!lakhs && lakhs !== 0) return "—";
  if (lakhs >= 100000) {
    return `₹${(lakhs / 100000).toFixed(2)} K Cr`;
  }
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return `₹${cr >= 10 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
  }
  return `₹${lakhs.toFixed(1)} L`;
}

/** Compact format for vote counts — uses L (lakhs) and K (thousand) suffixes. */
export function formatVotes(votes: number): string {
  if (votes >= 100000) return `${(votes / 100000).toFixed(2)} L`;
  if (votes >= 1000) return `${(votes / 1000).toFixed(1)} K`;
  return String(votes);
}

// Party / character colours live in lib/party-colors.ts. Re-exported here so
// existing call sites (data-utils consumers) continue to work without churn.
export { getPartyColor, getCharacterBadgeColor } from "./party-colors";
