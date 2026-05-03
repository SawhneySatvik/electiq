/**
 * Brand colours for Indian political parties.
 *
 * These are *brand* colours — independent of the light/dark theme. Used by:
 *  - the India choropleth map (`components/explore/IndiaMap.tsx`) to fill each
 *    state with its dominant LS-winner party colour;
 *  - the exit-poll bar chart (`app/exit-poll/page.tsx`);
 *  - per-party badges throughout the app.
 *
 * Add a new entry whenever a new party appears as a winner / runner-up in the
 * dataset. Unknown parties resolve to neutral grey.
 */

const PARTY_COLORS: Record<string, string> = {
  // National parties
  BJP: "#f97316",
  INC: "#2563eb",
  AAP: "#06b6d4",
  TMC: "#10b981",
  SP: "#e11d48",
  DMK: "#7c3aed",
  AIADMK: "#0ea5e9",
  BSP: "#3b82f6",
  NCP: "#8b5cf6",
  SS: "#f59e0b",
  TDP: "#facc15",
  YSRCP: "#22d3ee",
  BRS: "#84cc16",
  "CPI(M)": "#dc2626",
  CPI: "#ef4444",
  "JD(U)": "#65a30d",
  "JD(S)": "#a3e635",
  RJD: "#16a34a",
  RLD: "#fbbf24",
  AIMIM: "#14b8a6",
  SAD: "#0284c7",
  LJP: "#fb7185",
  "LJP(RV)": "#fb7185",
  HAM: "#a855f7",
  MDMK: "#ec4899",
  PRP: "#94a3b8",
  PPP: "#94a3b8",
  VIP: "#6366f1",

  // State + regional parties
  BJD: "#0d9488",
  JMM: "#15803d",
  AGP: "#f43f5e",
  INLD: "#0284c7",
  JJP: "#fde047",
  HJC: "#f97316",
  NPP: "#a78bfa",
  MGP: "#fbbf24",
  IND: "#6b7280",

  // J&K / Northeast / island regional parties
  NC: "#0ea5e9",
  PDP: "#14b8a6",
  PC: "#ec4899",
  MNF: "#16a34a",
  ZPM: "#22c55e",
  NPF: "#dc2626",
  NDPP: "#a855f7",
  VPP: "#7c3aed",
  UDP: "#0891b2",
  KHNAM: "#06b6d4",
  TIPRA: "#ef4444",
  INPT: "#7c3aed",
};

const FALLBACK = "#71717a";

/**
 * Look up a party's brand colour. Falls back to neutral grey for unknown parties
 * so the UI never breaks when new data arrives ahead of a colour mapping.
 */
export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] ?? FALLBACK;
}

/** Semantic colour for the constituency-character badge. */
export function getCharacterBadgeColor(character: string): string {
  if (character === "stronghold") return "#10b981";
  if (character === "swing") return "#f59e0b";
  if (character === "volatile") return "#ef4444";
  return FALLBACK;
}

/** Read-only access to all party→colour mappings. Useful for tests and legends. */
export function listPartyColors(): Readonly<Record<string, string>> {
  return PARTY_COLORS;
}
