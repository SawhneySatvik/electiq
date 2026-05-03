"use client";

import { useElectionStore } from "@/store/useElectionStore";

const STATE_CENTROIDS: Record<string, [number, number]> = {
  "Andhra Pradesh": [79.74, 15.91],
  Bihar: [85.31, 25.1],
  Delhi: [77.1, 28.66],
  Gujarat: [71.66, 22.5],
  Karnataka: [75.71, 15.32],
  Kerala: [76.27, 10.85],
  Maharashtra: [75.71, 19.75],
  Punjab: [75.34, 31.15],
  Rajasthan: [74.22, 27.02],
  "Tamil Nadu": [78.66, 11.13],
  "Uttar Pradesh": [80.95, 26.85],
  "West Bengal": [87.86, 22.98],
};

const VIEW_LON: [number, number] = [68, 98];
const VIEW_LAT: [number, number] = [6, 36];

interface Props {
  states: string[];
  countByState: Record<string, number>;
  width?: number;
  height?: number;
}

export function BubbleFallback({ states, countByState, width = 600, height = 600 }: Props) {
  const setState = useElectionStore((s) => s.setSelectedState);
  const selected = useElectionStore((s) => s.selectedState);

  const project = (lon: number, lat: number): [number, number] => {
    const x = ((lon - VIEW_LON[0]) / (VIEW_LON[1] - VIEW_LON[0])) * width;
    const y = height - ((lat - VIEW_LAT[0]) / (VIEW_LAT[1] - VIEW_LAT[0])) * height;
    return [x, y];
  };

  const counts = states.map((s) => countByState[s] ?? 0);
  const maxCount = Math.max(1, ...counts);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto bg-surface rounded-xl border border-border"
      role="img"
      aria-label="India bubble map"
    >
      <rect x={0} y={0} width={width} height={height} fill="transparent" />
      {states.map((state) => {
        const centroid = STATE_CENTROIDS[state];
        if (!centroid) return null;
        const [cx, cy] = project(centroid[0], centroid[1]);
        const count = countByState[state] ?? 0;
        const r = 8 + 22 * Math.sqrt(count / maxCount);
        const isSelected = selected === state;
        return (
          <g
            key={state}
            onClick={() => setState(isSelected ? null : state)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={isSelected ? "rgb(var(--accent) / 0.85)" : "rgb(var(--accent) / 0.35)"}
              stroke="rgb(var(--accent))"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + r + 12}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              className="text-text/80 pointer-events-none"
            >
              {state}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
