"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface DualTrendChartProps {
  data: Array<{ label: string; spend: number; leads: number }>;
}

function formatIDRShort(value: number) {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp${Math.round(value / 1000)}K`;
  return `Rp${value}`;
}

/** Dua garis dengan skala berbeda (Spend kiri dalam Rupiah, Leads kanan dalam angka) — dipakai Meta Ads Performance di Overview. */
export function DualTrendChart({ data }: DualTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
        <YAxis
          yAxisId="spend"
          tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={formatIDRShort}
        />
        <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, fontFamily: "var(--font-body)", boxShadow: "0 4px 16px -4px rgba(24,24,27,0.12)" }}
          formatter={(value, name) => (name === "spend" ? formatIDRShort(Number(value)) : value)}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-data)" }} formatter={(v) => (v === "spend" ? "Spend" : "Leads")} />
        <Line yAxisId="spend" type="monotone" dataKey="spend" name="spend" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 2.5, fill: "#1d4ed8" }} activeDot={{ r: 5 }} />
        <Line yAxisId="leads" type="monotone" dataKey="leads" name="leads" stroke="#16a34a" strokeWidth={2} dot={{ r: 2.5, fill: "#16a34a" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
