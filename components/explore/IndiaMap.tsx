"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { geoBounds } from "d3-geo";
import { useElectionStore } from "@/store/useElectionStore";
import { useT } from "@/lib/translation-runtime";
import { BubbleFallback } from "./BubbleFallback";

const GEO_URL = "/india-states.geojson";
const DEFAULT_CENTER: [number, number] = [82, 22];
const DEFAULT_ZOOM = 1;
const MAP_WIDTH = 600;
const MAP_HEIGHT = 600;
const MAP_SCALE = 950;
const ZOOM_DURATION_MS = 450;

interface Props {
  knownStates: string[];
  countByState: Record<string, number>;
  dominantPartyByState: Record<string, string>;
  partyColors: Record<string, string>;
}

interface ViewState {
  center: [number, number];
  zoom: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function IndiaMap({
  knownStates,
  countByState,
  dominantPartyByState,
  partyColors,
}: Props) {
  const [geoData, setGeoData] = useState<{
    type: string;
    features: { properties: { ST_NM?: string }; [k: string]: unknown }[];
  } | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const animationRef = useRef<number | null>(null);
  const setStateSelected = useElectionStore((s) => s.setSelectedState);
  const selected = useElectionStore((s) => s.selectedState);
  const knownSet = new Set(knownStates);
  const resetLabel = useT("explore.map.reset");
  const legendLabel = useT("explore.map.legend");

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

  const animateView = (target: ViewState) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    const start = performance.now();
    const from = view;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ZOOM_DURATION_MS);
      const eased = easeOutCubic(t);
      setView({
        center: [
          from.center[0] + (target.center[0] - from.center[0]) * eased,
          from.center[1] + (target.center[1] - from.center[1]) * eased,
        ],
        zoom: from.zoom + (target.zoom - from.zoom) * eased,
      });
      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleStateClick = (name: string, geo: unknown) => {
    if (!knownSet.has(name)) return;
    if (selected === name) {
      setStateSelected(null);
      animateView({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
      return;
    }
    setStateSelected(name);
    try {
      const [[lon0, lat0], [lon1, lat1]] = geoBounds(geo as never);
      const center: [number, number] = [(lon0 + lon1) / 2, (lat0 + lat1) / 2];
      const lonSpan = Math.max(0.5, lon1 - lon0);
      const latSpan = Math.max(0.5, lat1 - lat0);
      const span = Math.max(lonSpan, latSpan);
      const zoom = Math.min(8, Math.max(1.5, 24 / span));
      animateView({ center, zoom });
    } catch {
      // bounds calc failed (degenerate geometry) — leave view as is
    }
  };

  const reset = () => {
    setStateSelected(null);
    animateView({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  };

  const legendEntries = useMemo(() => {
    const seen = new Map<string, number>();
    for (const state of knownStates) {
      const party = dominantPartyByState[state];
      if (!party) continue;
      seen.set(party, (seen.get(party) ?? 0) + 1);
    }
    return [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [knownStates, dominantPartyByState]);

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
        projectionConfig={{ scale: MAP_SCALE, center: DEFAULT_CENTER }}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup
          center={view.center}
          zoom={view.zoom}
          minZoom={1}
          maxZoom={10}
          translateExtent={[
            [-200, -200],
            [MAP_WIDTH + 200, MAP_HEIGHT + 200],
          ]}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name: string = geo.properties.ST_NM ?? "";
                const isKnown = knownSet.has(name);
                const isSelected = selected === name;
                const isHovered = hovered === name;
                const dominant = dominantPartyByState[name];
                const baseColor = isKnown && dominant ? partyColors[dominant] ?? null : null;
                const fill = !isKnown
                  ? "rgb(var(--text) / 0.05)"
                  : baseColor
                    ? `${baseColor}${isSelected ? "cc" : isHovered ? "99" : "44"}`
                    : isSelected
                      ? "rgb(var(--accent) / 0.75)"
                      : isHovered
                        ? "rgb(var(--accent) / 0.4)"
                        : "rgb(var(--accent) / 0.2)";
                const stroke = isSelected
                  ? "rgb(var(--text) / 0.9)"
                  : isKnown
                    ? "rgb(var(--text) / 0.35)"
                    : "rgb(var(--text) / 0.18)";
                const strokeWidth = isSelected ? 1 : 0.5;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHovered(name)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleStateClick(name, geo)}
                    style={{
                      default: {
                        fill,
                        stroke,
                        strokeWidth,
                        outline: "none",
                        cursor: isKnown ? "pointer" : "default",
                      },
                      hover: {
                        fill,
                        stroke,
                        strokeWidth: strokeWidth + 0.3,
                        outline: "none",
                        cursor: isKnown ? "pointer" : "default",
                      },
                      pressed: {
                        fill,
                        stroke,
                        strokeWidth: strokeWidth + 0.3,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hovered && (
        <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded bg-bg/85 backdrop-blur border border-border pointer-events-none">
          <span className="font-medium">{hovered}</span>
          {knownSet.has(hovered) ? (
            <>
              {dominantPartyByState[hovered] && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded font-mono text-[10px]"
                  style={{
                    background: (partyColors[dominantPartyByState[hovered]] ?? "#71717a") + "33",
                    color: partyColors[dominantPartyByState[hovered]] ?? "#71717a",
                  }}
                >
                  {dominantPartyByState[hovered]}
                </span>
              )}
              <span className="text-muted ml-2">{countByState[hovered] ?? 0} seats</span>
            </>
          ) : (
            <span className="text-muted ml-2">No data</span>
          )}
        </div>
      )}

      {(selected || view.zoom !== DEFAULT_ZOOM) && (
        <button
          onClick={reset}
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-bg/85 backdrop-blur border border-border hover:border-accent/60 transition-colors"
        >
          {resetLabel}
        </button>
      )}

      {legendEntries.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-bg/85 backdrop-blur border border-border rounded-md px-2.5 py-2 text-[10px]">
          <div className="text-muted uppercase tracking-widest mb-1">{legendLabel}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 max-w-[260px]">
            {legendEntries.map(([party, n]) => (
              <span key={party} className="inline-flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: partyColors[party] ?? "#71717a" }}
                />
                <span className="font-mono">{party}</span>
                <span className="text-muted">·{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
