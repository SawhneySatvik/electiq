import { StateSelector, ElectionTypeToggle } from "@/components/explore/StateSelector";
import { ConstituencyGrid } from "@/components/explore/ConstituencyGrid";
import { getAllStates } from "@/lib/data-utils";

export default function ExplorePage() {
  const states = getAllStates();
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Explore</h1>
        <p className="text-muted">
          Pick a state, toggle election type, drill into a constituency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
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
