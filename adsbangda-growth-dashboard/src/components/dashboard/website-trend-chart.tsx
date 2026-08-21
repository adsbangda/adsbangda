"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export interface WebsiteTrendPoint {
  label: string;
  visitors?: number | null;
  sessions?: number | null;
  pageViews?: number | null;
}

/** Satu seri per metrik — warna & label satu sumber kebenaran, sama pola dengan SocialTrendChart. */
const SERIES: { key: keyof Omit<WebsiteTrendPoint, "label">; label: string; color: string }[] = [
  { key: "visitors", label: "Visitors", color: "#1d4ed8" },
  { key: "sessions", label: "Sessions", color: "#16a34a" },
  { key: "pageViews", label: "Page Views", color: "#9333ea" },
];

function formatValue(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Satu grafik gabungan untuk Website Traffic (Visitors, Sessions, Page
 * Views) — data langsung dari raw performance data yang admin input,
 * tidak ada angka hardcode. Baris yang tidak punya nilai untuk suatu
 * metrik otomatis membuat garis metrik itu putus di titik tersebut
 * (recharts default `connectNulls` dimatikan cuma untuk seri itu),
 * bukan dianggap 0 — sama pola dengan SocialTrendChart.
 */
export function WebsiteTrendChart({ data }: { data: WebsiteTrendPoint[] }) {
  const activeSeries = SERIES.filter((s) => data.some((d) => d[s.key] != null));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => formatValue(Number(v))}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 12,
            fontFamily: "var(--font-body)",
            boxShadow: "0 4px 16px -4px rgba(24,24,27,0.12)",
          }}
          formatter={(value, name) => [formatValue(Number(value)), name]}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-data)", paddingTop: 12 }} iconType="circle" iconSize={8} />
        {activeSeries.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 2.5, fill: s.color }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
