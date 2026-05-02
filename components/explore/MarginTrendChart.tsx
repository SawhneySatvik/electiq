"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { LSResult } from "@/lib/types";

interface Props {
  rows: LSResult[];
}

export function MarginTrendChart({ rows }: Props) {
  const data = [...rows]
    .sort((a, b) => a.year - b.year)
    .map((r) => ({
      year: r.year,
      marginK: Math.round(r.margin / 1000),
      turnout: r.turnout,
      winner: r.winner,
      party: r.party,
    }));

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-lg font-bold">Margin trend</h3>
        <span className="text-xs text-muted">in thousands of votes</span>
      </div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="2 4" />
            <XAxis dataKey="year" stroke="#71717a" tick={{ fontSize: 12 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#111113",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#fafafa", fontWeight: 600 }}
              formatter={(value: unknown, _name: unknown, payload: { payload?: { winner?: string; party?: string } }) => {
                const item = payload.payload;
                return [`+${value}K · ${item?.winner ?? ""} (${item?.party ?? ""})`, "Margin"];
              }}
            />
            <Line
              type="monotone"
              dataKey="marginK"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 5, stroke: "#f97316", fill: "#09090b", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
