// Tipe data ini merefleksikan skema database di supabase/migrations/0001_init.sql.
// Dipakai bersama oleh mock-data.ts (mode demo) dan query Supabase (mode live),
// jadi UI tidak perlu tahu datanya datang dari mock atau database sungguhan.

export type TaskStatus = "not_started" | "in_progress" | "waiting" | "done";
export type ContentStatus = "draft" | "in_production" | "waiting_approval" | "approved" | "scheduled" | "published";
export type Channel = "meta_ads" | "social" | "website";
export type Platform = "instagram" | "facebook" | "tiktok" | "website";
export type ContentType = "reel" | "carousel" | "story" | "post" | "article";

/** Platform social media yang didukung modul Social Media (konsolidasi). */
export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "x" | "linkedin" | "threads";

/** Jenis content per platform — platform berbeda punya pilihan berbeda. */
export const CONTENT_TYPES_BY_PLATFORM: Record<SocialPlatform, string[]> = {
  instagram: ["feed", "reels", "story"],
  facebook: ["feed", "reels", "story"],
  tiktok: ["video"],
  x: ["post"],
  linkedin: ["post"],
  threads: ["post"],
};

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry: string;
  status: "active" | "paused" | "onboarding" | "archived";
  website?: string | null;
  description?: string | null;
  /** Layanan aktif untuk client ini — dipakai buat tahu tab/section mana yang relevan. */
  socialMediaActive?: boolean;
  metaAdsActive?: boolean;
  websiteActive?: boolean;
  /**
   * Tenant tertinggi (agency-level). Optional di tipe supaya mock-data mode
   * demo tidak wajib mengisinya — di mode live selalu terisi (kolom NOT NULL
   * di DB, default ke organization "Adsbangda" lewat migration 0004).
   */
  organizationId?: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate: string;
  /** Health indicator dipakai Client Portal (project aktif yang ditampilkan ke client). Jangan disamakan dengan `stage`. */
  status: "on_track" | "at_risk" | "completed" | "on_hold";
  /**
   * Lifecycle stage untuk Admin Portal (Phase 2) — orthogonal dari `status`.
   * Dipakai untuk kelola banyak project per client (list, archive, dsb),
   * bukan untuk tampilan health indicator di Client Portal.
   */
  stage?: "planning" | "active" | "on_hold" | "completed" | "archived";
  /** Bebas diperluas — nilai umum: social_media, meta_ads, website, branding, other. */
  type?: string;
  description?: string | null;
  /** Progress manual yang di-set admin di Phase 2 — berbeda dari progress per-task di ProjectTask. */
  progressPct?: number;
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
  /** Hanya relevan untuk channel='social' — platform mana snapshot ini. */
  platform?: SocialPlatform;
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
  // Website-specific
  pageViews?: number;
  sessions?: number;
  bounceRate?: number;
  avgSessionDuration?: string;
  // Meta Ads-specific — input manual admin, BUKAN dihitung otomatis.
  ctr?: number;
  cpc?: number;
  roas?: number;
  /** Opsional — kalau diisi, Meta Ads bisa tampilkan Goal Achievement %. */
  targetLeads?: number;
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
  assetUrl?: string | null;
  publishLink?: string | null;
  approvalRequired?: boolean;
  approvalStatus?: "pending" | "approved" | "revision" | null;
}

export interface ContentTarget {
  id: string;
  clientId: string;
  period: string;
  platform: SocialPlatform;
  contentType: string;
  target: number;
}

export interface WebsiteActivityEntry {
  id: string;
  clientId: string;
  date: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "planned";
}

export interface ApprovalHistoryEntry {
  id: string;
  contentId: string;
  action: "submitted" | "approved" | "revision_requested" | "note";
  note: string;
  actor: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  clientId: string;
  periodMonth: string; // contoh: "2026-08"
  fileUrl: string;
  generatedAt: string;
  summary: string;
}

export type GoalStatus = "draft" | "on_track" | "at_risk" | "completed" | "archived";

export interface Goal {
  id: string;
  clientId: string;
  label: string;
  description?: string | null;
  target: number;
  actual: number;
  unit: string;
  period: string;
  status: GoalStatus;
  notes?: string | null;
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

// Role architecture — foundation Phase 1 (lihat supabase/migrations/0004).
// 5 tingkat: super_admin & admin punya akses penuh (is_admin() di DB tidak
// membedakan keduanya untuk hak akses — bedanya cuma super_admin yang boleh
// menaikkan orang lain jadi admin-tier). account_manager & creative adalah
// role staff (is_staff()) yang DISIAPKAN untuk permission granular di fase
// berikutnya — Phase 1 sengaja belum membatasi kemampuan mereka lebih detail
// dari "admin" supaya scope tetap kecil, sesuai arahan "jangan terlalu rumit
// dulu di foundation".
export type UserRole = "super_admin" | "admin" | "account_manager" | "creative" | "client";

/** Role apa pun selain 'client' dianggap staff internal Adsbangda. */
export const STAFF_ROLES: readonly UserRole[] = ["super_admin", "admin", "account_manager", "creative"];

/** Anggota staff yang bisa di-assign ke client/project (Phase 2). */
export interface TeamMember {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}
