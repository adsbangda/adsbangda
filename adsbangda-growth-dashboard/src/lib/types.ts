// Tipe data ini merefleksikan skema database di supabase/migrations/0001_init.sql.
// Dipakai bersama oleh mock-data.ts (mode demo) dan query Supabase (mode live),
// jadi UI tidak perlu tahu datanya datang dari mock atau database sungguhan.

export type TaskStatus = "not_started" | "in_progress" | "waiting" | "done";
export type ContentStatus = "draft" | "in_production" | "waiting_approval" | "approved" | "scheduled" | "published";
export type Channel = "meta_ads" | "social" | "website";
export type Platform = "instagram" | "facebook" | "tiktok" | "website";
export type ContentType = "reel" | "carousel" | "story" | "post" | "article";

export interface Client {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry: string;
  status: "active" | "paused" | "onboarding";
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "on_track" | "at_risk" | "completed" | "on_hold";
}

export interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  progressPct: number;
  orderIndex: number;
  owner: string;
  dueDate: string;
  blocker?: string;
}

export interface PerformanceMetric {
  id: string;
  clientId: string;
  date: string; // ISO date, snapshot mingguan
  channel: Channel;
  spend?: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  costPerLead?: number;
  followers?: number;
  engagementRate?: number;
  visitors?: number;
  conversions?: number;
}

export interface ChannelSummary {
  channel: string;
  spend: number;
  leads: number;
  costPerLead: number;
  engagementRate: number;
  status: "healthy" | "watch" | "underperforming";
}

export interface ContentItem {
  id: string;
  clientId: string;
  title: string;
  plannedDate: string;
  status: ContentStatus;
  platform: Platform;
  type: ContentType;
  notes?: string;
}

export interface ReportItem {
  id: string;
  clientId: string;
  periodMonth: string; // contoh: "2026-08"
  fileUrl: string;
  generatedAt: string;
  summary: string;
}

export interface AttentionItem {
  id: string;
  icon: "approval" | "budget" | "meeting";
  title: string;
  description: string;
  href: string;
  countBadge?: number;
}

// ---------------------------------------------------------------------------
// Monthly Delivery — service-agnostic contracted-work tracking, rendered as
// the Overview's hero card: one dominant percentage plus a grid of individual
// deliverables. `icon` only selects which glyph/tint to show — it carries no
// business logic, so any service line can supply any icon.
// ---------------------------------------------------------------------------

export type DeliveryStatus = "on_track" | "at_risk" | "completed" | "delayed";
export type DeliveryIcon = "calendar" | "instagram" | "facebook" | "tiktok" | "edit" | "megaphone" | "chart";

export interface DeliveryMetricItem {
  id: string;
  icon: DeliveryIcon;
  label: string;
  completed: number;
  target: number;
  unit: string;
}

export interface MonthlyDeliveryMeta {
  periodRange: string;
  lastUpdated: string;
  agreedDate: string;
  contractHref: string;
}

export interface MonthlyDeliveryHero {
  periodLabel: string;
  overallPct: number;
  status: DeliveryStatus;
  helperText: string;
  items: DeliveryMetricItem[];
  meta: MonthlyDeliveryMeta;
}

export type QuickStatIcon = "send" | "story" | "heart" | "users";

export interface QuickStat {
  id: string;
  icon: QuickStatIcon;
  label: string;
  value: string;
  deltaLabel: string;
  deltaPositive: boolean;
}

export interface ActivityEntry {
  id: string;
  /** Grouping label — "Hari ini", "Kemarin", or a date like "9 Agustus 2026". */
  day: string;
  title: string;
  description: string;
  done: boolean;
  /** Purely decorative — number of demo thumbnail swatches to render. */
  thumbnailCount?: number;
}

export type ChannelIcon = "instagram" | "facebook" | "tiktok" | "reach";

export interface ChannelOverviewRow {
  id: string;
  icon: ChannelIcon;
  label: string;
  metricLabel: string;
  value: string;
  deltaLabel: string;
  sparkline: number[];
}

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  timeLabel: string;
}

export type ContentPlatform = "instagram_feed" | "instagram_story" | "facebook_post" | "tiktok_post";

export interface WeeklyCalendarRow {
  id: string;
  platform: ContentPlatform;
  label: string;
  /** One count per day, aligned with WeeklyCalendar.weekDays; null = no content. */
  counts: (number | null)[];
}

export interface WeeklyCalendarDay {
  label: string;
  date: number;
}

export interface WeeklyCalendar {
  weekDays: WeeklyCalendarDay[];
  activeIndex: number;
  rows: WeeklyCalendarRow[];
  totalLabel: string;
}

export interface FileEntry {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  updatedAt: string;
  sizeLabel: string;
}

// Role architecture — disiapkan untuk pemisahan Client vs Admin nanti.
// Belum ada UI Admin di MVP ini (lihat README), tapi tipe ini jadi dasar
// supaya penambahan /admin/* nanti tidak perlu migrasi ulang skema.
export type UserRole = "client" | "admin";
