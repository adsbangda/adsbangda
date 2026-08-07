"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TrendChartProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xKey?: string;
  format?: "number" | "idr";
}

function formatValue(value: number, format?: "number" | "idr") {
  if (format === "idr") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("id-ID").format(value);
}

export function TrendChart({
  data,
  dataKey,
  xKey = "label",
  format,
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#ECECEC" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#71717A", fontFamily: "var(--font-plex-mono)" }}
          axisLine={{ stroke: "#ECECEC" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717A", fontFamily: "var(--font-plex-mono)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v) => formatValue(v, format)}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #ECECEC",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            fontSize: "12px",
            fontFamily: "var(--font-plex-mono)",
            background: "#FFFFFF",
          }}
          formatter={(value) => [formatValue(Number(value), format), "Total"]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#1D4ED8"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#1D4ED8" }}
          activeDot={{ r: 6, fill: "#1D4ED8", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}