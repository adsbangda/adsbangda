"use client";

import { useState } from "react";
import { Tabs } from "./tabs";

const RANGE_OPTIONS = [
  { value: "5w", label: "5 Minggu" },
  { value: "12w", label: "12 Minggu" },
];

/**
 * Visual-only date range control for the Performance page (spec §13).
 * Phase 1 is UI-shell only — no new data fetching logic — so this simply
 * tracks the selected range locally. Wiring it to actually refetch data
 * belongs to a later phase once live metrics are available.
 */
export function DateRangeTabs() {
  const [range, setRange] = useState("5w");
  return <Tabs options={RANGE_OPTIONS} value={range} onChange={setRange} />;
}
