"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useElectionStore } from "@/store/useElectionStore";
import { BubbleFallback } from "./BubbleFallback";

const GEO_URL = "/india-states.geojson";

interface Props {
  knownStates: string[];
  countByState: Record<string, number>;
}

export function IndiaMap({ knownStates, countByState }: Props) {
  const [geoData, setGeoData] = useState<unknown | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const setState = useElectionStore((s) => s.setSelectedState);
  const selected = useElectionStore((s) => s.selectedState);
  const knownSet = new Set(knownStates);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setGeoData(d);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return <BubbleFallback states={knownStates} countByState={countByState} />;
  }

  if (!geoData) {
    return (
      <div className="aspect-square w-full bg-surface border border-border rounded-xl flex items-center justify-center text-xs text-muted">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative bg-surface border border-border rounded-xl overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 950, center: [82, 22] }}
        width={600}
        height={600}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.ST_NM ?? "";
              const isKnown = knownSet.has(name);
              const isSelected = selected === name;
              const isHovered = hovered === name;
              const fill = isSelected
                ? "rgb(var(--accent) / 0.75)"
                : isHovered && isKnown
                  ? "rgb(var(--accent) / 0.4)"
                  : isKnown
                    ? "rgb(var(--accent) / 0.18)"
                    : "rgb(var(--text) / 0.06)";
              const stroke = isKnown
                ? "rgb(var(--accent) / 0.7)"
                : "rgb(var(--text) / 0.18)";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (!isKnown) return;
                    setState(isSelected ? null : name);
                  }}
                  style={{
                    default: {
                      fill,
                      stroke,
                      strokeWidth: 0.6,
                      outline: "none",
                      cursor: isKnown ? "pointer" : "default",
                    },
                    hover: {
                      fill,
                      stroke,
                      strokeWidth: 0.8,
                      outline: "none",
                      cursor: isKnown ? "pointer" : "default",
                    },
                    pressed: {
                      fill,
                      stroke,
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {hovered && (
        <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded bg-bg/80 backdrop-blur border border-border pointer-events-none">
          <span className="font-medium">{hovered}</span>
          {knownSet.has(hovered) ? (
            <span className="text-muted ml-2">{countByState[hovered] ?? 0} seats in dataset</span>
          ) : (
            <span className="text-muted ml-2">No data</span>
          )}
        </div>
      )}
    </div>
  );
}
