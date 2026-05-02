export type ElectionType = "LS" | "VS";
export type ReservedCategory = "GEN" | "SC" | "ST";

export interface LSResult {
  year: number;
  winner: string;
  party: string;
  votes: number;
  margin: number;
  turnout: number;
  runner_up: string;
  runner_up_party: string;
}

export interface LSConstituency {
  id: string;
  name: string;
  state: string;
  reserved: ReservedCategory;
  results: LSResult[];
}

export interface VSResult {
  id: string;
  name: string;
  winner: string;
  party: string;
  votes: number;
  margin: number;
  turnout: number;
  runner_up: string;
  runner_up_party: string;
}

export interface StateElectionYear {
  year: number;
  total_seats: number;
  constituencies: VSResult[];
}

export interface StateElection {
  state: string;
  elections: StateElectionYear[];
}

export interface AssetsBreakdown {
  movable_assets_lakhs: number;
  immovable_assets_lakhs: number;
}

export interface Candidate {
  id: string;
  name: string;
  state: string;
  constituency: string;
  constituency_id: string;
  election_type: ElectionType;
  year: number;
  party: string;
  total_assets_lakhs: number;
  total_liabilities_lakhs: number;
  assets_breakdown: AssetsBreakdown;
  criminal_cases: number;
  criminal_cases_detail: string;
  education: string;
  age: number;
  won: boolean;
  pan_declared: boolean;
  itr_filed: boolean;
}

export interface CandidateFilters {
  state: string;
  party: string;
  year: number | null;
  electionType: string; // "ALL" | "LS" | "VS"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextRecordIds?: string[];
}

export interface ChatContextRecord {
  type: "constituency" | "vs_constituency" | "candidate";
  id: string;
  label: string;
  data: unknown;
}

export interface ConstituencyAnalysis {
  character: "stronghold" | "swing" | "volatile";
  dominant_party: string;
  trend_summary: string;
  key_shift: string;
  competitiveness: string;
  watch_factors: string[];
}

export interface CandidateInsight {
  wealth_summary: string;
  wealth_context: string;
  liability_note: string;
  criminal_context: string;
  overall_profile: string;
}
