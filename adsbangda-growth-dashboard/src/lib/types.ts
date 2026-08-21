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

/** Jenis content per platform — platform berbeda punya pilihan berbeda, mengikuti fitur upload asli tiap platform. */
export const CONTENT_TYPES_BY_PLATFORM: Record<SocialPlatform, string[]> = {
  instagram: ["feed", "reels", "story", "carousel"],
  facebook: ["post", "video"],
  tiktok: ["video", "photo"],
  x: ["post", "video"],
  linkedin: ["post", "article"],
  threads: ["post"],
};

/** Label tampilan buat tiap contentType — dipakai lintas layer (data.ts & komponen UI), satu sumber kebenaran. */
export const CONTENT_TYPE_LABEL: Record<string, string> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  reel: "Reels",
  video: "Video",
  post: "Post",
  photo: "Foto",
  carousel: "Carousel",
  article: "Article",
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
   * Budget iklan Meta Ads bulanan yang disepakati — persisten di level
   * client, diisi/diubah sesekali lewat Admin → Meta Ads (card terpisah
   * dari form Performance Data mingguan), BUKAN diketik ulang tiap kali
   * admin input snapshot leads/spend. Dipakai buat "Budget Terpakai" di
   * Overview & halaman Meta Ads (spend snapshot terbaru / angka ini).
   */
  metaAdsBudgetTarget?: number;
  /**
   * GA4 Property ID (mis. "properties/123456789" atau cukup angkanya
   * saja) — diisi admin lewat Admin → Website → "Google Analytics 4"
   * SEKALI per client, opsional. Kalau kosong/null, client ini tetap
   * manual sepenuhnya (job sync otomatis tidak pernah menyentuhnya).
   * Prasyarat: client sudah kasih akses Viewer di GA4 property mereka ke
   * service account Adsbangda (lihat `getServiceAccountEmail()` di
   * `src/lib/ga4-sync.ts`) — kalau belum, sync akan gagal dengan pesan
   * error yang jelas, TAPI form input manual di halaman yang sama tetap
   * berfungsi normal seperti biasa.
   */
  ga4PropertyId?: string | null;
  /**
   * Opsional — hostname website utama (mis. "wellnerconsulting.com"),
   * dipakai buat FILTER data GA4 kalau property yang sama juga dipasang
   * di landing page iklan terpisah (subdomain lain). Kosong = semua data
   * di property itu digabung apa adanya (perilaku default). Lihat migration
   * 0018 & `src/lib/ga4-sync.ts` untuk detail.
   */
  ga4Hostname?: string | null;
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
  /** @deprecated Digantikan `services` (multi-select) — dibiarkan ada di tipe supaya data lama tidak error, jangan ditulis lagi di kode baru. */
  type?: string;
  /**
   * Layanan (paket) yang dicakup project ini — BOLEH lebih dari satu (mis.
   * client ambil "Social Media Management" + "Website & Landing Page"
   * sekaligus, ditampilkan gabung di Client Portal). Disimpan sebagai teks
   * label langsung (bukan foreign key ke tabel `services`) — supaya admin
   * bebas edit/hapus katalog layanan kapan saja TANPA merusak data project
   * yang sudah ada (project lama tetap menyimpan label persis seperti saat
   * dipilih).
   */
  services?: string[];
  /** Periode berjalan, format "YYYY-MM" — diupdate admin tiap bulan begitu paket/project di-roll ke bulan berikutnya. */
  period?: string;
  description?: string | null;
  /** Progress manual yang di-set admin di Phase 2 — berbeda dari progress per-task di ProjectTask. */
  progressPct?: number;
}

/**
 * Katalog layanan (paket) yang ditawarkan agency — dikelola BEBAS oleh admin
 * (tambah/edit/hapus kapan saja lewat Admin → Clients → pilih client →
 * Projects). Global per organization, dipakai sebagai daftar pilihan cepat
 * saat bikin/edit project — TIDAK direferensikan sebagai foreign key oleh
 * Project (lihat `Project.services`), jadi menghapus satu layanan dari
 * katalog ini tidak pernah mengubah data project yang sudah ada.
 */
export interface Service {
  id: string;
  label: string;
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
  /**
   * Cuma relevan buat channel='social' platform='threads' — Threads tidak
   * punya Reach/Profile Visits terpisah (semua digabung jadi "views", ikut
   * kolom `impressions`), tapi punya breakdown Replies & Reposts yang
   * platform lain tidak punya. Lihat migration 0020.
   */
  replies?: number;
  reposts?: number;
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
  /**
   * @deprecated Sejak migration 0013, budget target Meta Ads pindah jadi
   * persisten di level client (`Client.metaAdsBudgetTarget`) — TIDAK lagi
   * diisi per snapshot. Field ini dibiarkan ada di tipe (kolom lama di DB
   * masih ada) supaya data historis lama tidak error kalau kebaca, tapi
   * jangan ditulis/dibaca lagi di kode baru. Pakai `Client.metaAdsBudgetTarget`.
   */
  budgetTarget?: number;
  /** Deal yang benar-benar closing dari leads Meta Ads. */
  closing?: number;
  conversionRate?: number;
  /**
   * Sumber baris ini — 'manual' (input admin lewat form, DEFAULT) atau
   * 'ga4' (diisi otomatis oleh sync job GA4 Data API). Cuma relevan untuk
   * channel='website'. Dipakai buat nampilin badge kecil "GA4"/"Manual" di
   * Performance History Admin Portal, dan supaya sync job tahu baris mana
   * yang boleh dia timpa (source='ga4') vs yang harus dia diamkan sama
   * sekali (source='manual').
   */
  source?: "manual" | "ga4";
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
  /** 'meta' = otomatis kebuat dari sync Threads/Instagram/Facebook (lihat meta-sync.ts), 'manual' = diinput admin sendiri. */
  source?: "manual" | "meta";
}

export interface ContentTarget {
  id: string;
  clientId: string;
  period: string;
  platform: SocialPlatform;
  contentType: string;
  target: number;
}

/**
 * Breakdown per-platform buat card "Social Media Performance" di Overview —
 * satu entri per platform yang PERNAH punya content_targets (lihat
 * getSocialMediaBreakdown di lib/data.ts). Platform yang belum pernah
 * dikonfigurasi tidak akan pernah muncul di array ini — bukan filter di
 * level komponen, tapi memang tidak pernah ke-query.
 */
export interface SocialPlatformSummary {
  platform: SocialPlatform;
  items: { contentType: string; completed: number; target: number }[];
}

/** Baris tabel "Platform Performance" di Overview — lihat getPlatformPerformanceTable() di lib/data.ts. */
export interface PlatformPerformanceRow {
  platform: string;
  followers?: number;
  followersDelta?: number | null;
  reach?: number;
  reachDelta?: number | null;
  impressions?: number;
  impressionsDelta?: number | null;
  profileVisit?: number;
  profileVisitDelta?: number | null;
  engagementRate?: number;
  engagementRateDelta?: number | null;
  /**
   * Cuma terisi buat platform='threads' (Threads tidak punya Reach/Profile
   * Visit terpisah, diganti Replies/Reposts) — kosong (undefined) buat
   * platform lain, tampil "—" di tabel.
   */
  replies?: number;
  repliesDelta?: number | null;
  reposts?: number;
  repostsDelta?: number | null;
}

/**
 * Satu postingan yang sudah publish, dengan metrik lengkapnya sendiri
 * (bukan snapshot agregat platform seperti PerformanceMetric) — dipakai
 * untuk tabel "Post Ranking" di halaman Social Media (Client Portal),
 * menggantikan section "Engagement per Platform" yang lama. Diisi manual
 * oleh admin per postingan lewat Admin → Social Media → Performance.
 *
 * `type` mengikuti CONTENT_TYPES_BY_PLATFORM platform terkait (mis. untuk
 * Instagram: feed/reels/story) — sengaja string bebas (bukan union ketat)
 * karena pilihannya berbeda-beda per platform.
 */
export interface PostPerformance {
  id: string;
  clientId: string;
  platform: SocialPlatform;
  type: string;
  title: string;
  postedDate: string; // ISO date
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  views?: number; // plays/views — reels, video, story
  permalink?: string | null;
  /** 'manual' (input admin, DEFAULT) vs 'meta' (diisi otomatis dari sync Instagram/Facebook/Threads). */
  source?: "manual" | "meta";
  /** ID media asli dari Meta — dipakai sync buat tahu postingan ini sudah pernah disync (update, bukan duplikat). Null untuk postingan manual. */
  externalPostId?: string | null;
}

/**
 * Kredensial auto-sync Instagram/Facebook/Threads — SATU baris per
 * (client, platform). `accessToken` SENSITIF, cuma pernah dibaca/ditulis
 * lewat service-role client di server (lihat migration 0019 & src/lib/meta-sync.ts).
 */
export interface SocialConnection {
  id: string;
  clientId: string;
  platform: "instagram" | "facebook" | "threads";
  externalAccountId: string;
  accessToken: string;
  tokenExpiresAt?: string | null;
  connectedAt: string;
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
  /** Grouping label — "Hari ini", "Kemarin", or a date like "9 Agustus 2026". Dihitung dari `occurredAt`, lihat activityDayLabel() di mappers.ts. */
  day: string;
  /** ISO datetime asli — dipakai Admin buat form edit (day cuma buat tampilan Client Portal). */
  occurredAt: string;
  title: string;
  description: string;
  done: boolean;
  /** Purely decorative — number of demo thumbnail swatches to render. */
  thumbnailCount?: number;
}

export type ChannelIcon = "instagram" | "facebook" | "tiktok" | "x" | "linkedin" | "threads" | "reach" | "meta_ads" | "website";

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


export interface WeeklyCalendarRow {
  id: string;
  platform: SocialPlatform;
  contentType: string;
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
