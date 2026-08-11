import { Calendar, PenLine, Megaphone, ChartColumn, Music2 } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "./platform-icons";
import type { DeliveryIcon } from "@/lib/types";

/**
 * Maps a deliverable's `icon` key to a glyph + soft/solid color pair. Colors
 * here are semantic in the sense that they identify a real platform
 * (Instagram pink, Facebook blue, TikTok black) — not decorative variety for
 * its own sake. The rest of the product still uses AdsBangda blue as the
 * single functional accent.
 */
export const DELIVERY_ICON_MAP: Record<DeliveryIcon, { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconClass: string; bgClass: string }> = {
  calendar: { Icon: Calendar, iconClass: "text-accent", bgClass: "bg-accent-soft" },
  instagram: { Icon: InstagramGlyph, iconClass: "text-pink-600", bgClass: "bg-pink-50" },
  facebook: { Icon: FacebookGlyph, iconClass: "text-blue-600", bgClass: "bg-blue-50" },
  tiktok: { Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" },
  edit: { Icon: PenLine, iconClass: "text-purple-600", bgClass: "bg-purple-50" },
  megaphone: { Icon: Megaphone, iconClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  chart: { Icon: ChartColumn, iconClass: "text-indigo-600", bgClass: "bg-indigo-50" },
};
