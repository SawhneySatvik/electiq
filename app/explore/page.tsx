"use client";

import { StateSelector, ElectionTypeToggle } from "@/components/explore/StateSelector";
import { ConstituencyGrid } from "@/components/explore/ConstituencyGrid";
import { IndiaMap } from "@/components/explore/IndiaMap";
import {
  getAllStates,
  getLokSabhaData,
  getDominantPartyByState,
  getPartyColor,
} from "@/lib/data-utils";
import { useT } from "@/lib/translation-runtime";

export default function ExplorePage() {
  const states = getAllStates();
  const ls = getLokSabhaData();
  const countByState: Record<string, number> = {};
  for (const c of ls) countByState[c.state] = (countByState[c.state] ?? 0) + 1;
  const dominantPartyByState = getDominantPartyByState();
  const partyColors: Record<string, string> = {};
  for (const party of new Set(Object.values(dominantPartyByState))) {
    if (party) partyColors[party] = getPartyColor(party);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{useT("explore.title")}</h1>
        <p className="text-muted">{useT("explore.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <IndiaMap
            knownStates={states}
            countByState={countByState}
            dominantPartyByState={dominantPartyByState}
            partyColors={partyColors}
          />
          <ElectionTypeToggle />
          <StateSelector states={states} />
        </aside>
        <section>
          <ConstituencyGrid />
        </section>
      </div>
    </div>
  );
}
