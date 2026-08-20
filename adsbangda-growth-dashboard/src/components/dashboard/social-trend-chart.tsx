"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export interface SocialTrendPoint {
  label: string;
  followers?: number | null;
  reach?: number | null;
  impressions?: number | null;
  profileVisit?: number | null;
}

/** Satu seri per metrik — warna & label SATU sumber kebenaran dipakai baik untuk garis maupun legend, supaya tidak perlu diketik ulang di dua tempat. */
const SERIES: { key: keyof Omit<SocialTrendPoint, "label">; label: string; color: string }[] = [
  { key: "followers", label: "Followers", color: "#1d4ed8" },
  { key: "reach", label: "Reach", color: "#16a34a" },
  { key: "impressions", label: "Impressions", color: "#9333ea" },
  { key: "profileVisit", label: "Profile Visit", color: "#ea580c" },
];

function formatValue(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Satu grafik gabungan untuk 4 metrik sosial (Followers, Reach, Impressions,
 * Profile Visit) dalam satu platform — menggantikan chart pertumbuhan
 * followers tunggal yang lama. Baris data yang tidak punya nilai untuk
 * suatu metrik otomatis membuat garis metrik itu putus di titik tersebut
 * (recharts default), bukan dianggap 0 — supaya tidak menyesatkan.
 */
export function SocialTrendChart({ data }: { data: SocialTrendPoint[] }) {
  // Cuma tampilkan seri yang MEMANG ada datanya di minimal satu titik —
  // kalau platform ini belum pernah diisi "Profile Visit" misalnya, garis
  // kosong itu tidak usah muncul di legend sama sekali.
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
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-data)", paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
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
