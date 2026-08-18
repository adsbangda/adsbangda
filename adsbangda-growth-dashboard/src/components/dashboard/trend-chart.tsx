"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface TrendChartProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xKey?: string;
  // String discriminator, bukan function — function tidak bisa dikirim dari
  // Server Component (halaman) ke Client Component (chart) ini.
  format?: "number" | "idr";
  /** "area" dipakai buat chart Website Performance (sesuai referensi desain — garis dengan fill tipis di bawahnya). */
  variant?: "line" | "area";
}

function formatValue(value: number, format?: "number" | "idr") {
  if (format === "idr") {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat("id-ID").format(value);
}

export function TrendChart({ data, dataKey, xKey = "label", format, variant = "line" }: TrendChartProps) {
  const sharedAxes = (
    <>
      <XAxis
        dataKey={xKey}
        tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }}
        axisLine={{ stroke: "#e5e7eb" }}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: "#6f6b5e", fontFamily: "var(--font-data)" }}
        axisLine={false}
        tickLine={false}
        width={48}
        tickFormatter={(v) => formatValue(v, format)}
      />
      <Tooltip
        contentStyle={{
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          fontSize: 12,
          fontFamily: "var(--font-body)",
          boxShadow: "0 4px 16px -4px rgba(24,24,27,0.12)",
        }}
        formatter={(value) => formatValue(Number(value), format)}
      />
    </>
  );

  if (variant === "area") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="trend-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
            </linearGradient>
          </defs>
          {sharedAxes}
          <Area type="monotone" dataKey={dataKey} stroke="#1d4ed8" strokeWidth={2} fill="url(#trend-area-fill)" dot={{ r: 2.5, fill: "#1d4ed8" }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        {sharedAxes}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#1d4ed8"
          strokeWidth={2}
          dot={{ r: 2.5, fill: "#1d4ed8" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
