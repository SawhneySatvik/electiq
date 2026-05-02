import { Suspense } from "react";
import { CandidatesClient } from "./CandidatesClient";
import { getAllStates, getAllParties, getAllYears } from "@/lib/data-utils";

export default function CandidatesPage() {
  const states = getAllStates();
  const parties = getAllParties();
  const years = getAllYears();
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-12 text-muted">Loading…</div>}>
      <CandidatesClient states={states} parties={parties} years={years} />
    </Suspense>
  );
}
