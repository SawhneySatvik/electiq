#!/usr/bin/env tsx
/**
 * sync-lokdhaba — STUB
 *
 * Lok Dhaba (Trivedi Centre for Political Data, Ashoka University) publishes
 * cleaned CSVs of every Indian election since 1962. This script is the
 * intended entry point for ingesting them into `data/lok_sabha.json` and
 * `data/state_elections.json`.
 *
 * Status: not implemented. The Election Commission of India has no public
 * JSON API; results.eci.gov.in serves HTML and eci.gov.in publishes PDFs,
 * so the realistic pipeline goes through Lok Dhaba CSVs.
 *
 * Usage (intended):
 *   npm run sync-lokdhaba -- --year 2024 --type LS
 *   npm run sync-lokdhaba -- --year 2021 --type VS --state "Tamil Nadu"
 *
 * Outstanding work:
 *   1. Determine per-year, per-type CSV URLs from lokdhaba.ashoka.edu.in.
 *   2. `npm i -D csv-parse` (already added) for parsing.
 *   3. Map their PC_NO / AC_NO to our slugged constituency ids.
 *   4. Merge into existing JSON without losing existing curated rows.
 *   5. Diff-print so a reviewer can sanity-check before commit.
 */

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i += 1;
      } else {
        out[key] = "true";
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const year = args.year ?? "2024";
const type = (args.type ?? "LS").toUpperCase();
const state = args.state;

console.log("[sync-lokdhaba] STUB — no work performed yet.");
console.log(`  year:  ${year}`);
console.log(`  type:  ${type}`);
if (state) console.log(`  state: ${state}`);
console.log(
  "  next:  fill in the CSV URL pattern and parser. See scripts/sync-lokdhaba.ts header for the checklist.",
);
process.exit(0);
