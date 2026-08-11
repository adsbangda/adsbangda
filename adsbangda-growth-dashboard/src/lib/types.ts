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
  title: string;
  description: string;
  dueLabel: string;
  actionLabel: string;
  actionHref: string;
  urgent: boolean;
}

// ---------------------------------------------------------------------------
// Monthly Delivery — service-agnostic contracted-work tracking.
//
// This is intentionally generic: a "deliverable" only knows how to describe
// its own progress (a fixed quantity, a soft cap, a recurring cadence, a
// milestone sequence, or a single monthly artifact). The Overview renders
// whatever groups/deliverables it receives — nothing about "Social Media" or
// "Meta Ads" is hardcoded into the component layer. Later phases will feed
// this from data the Admin Portal writes; for now it comes from mock-data.ts.
// ---------------------------------------------------------------------------

export type DeliveryStatus = "on_track" | "at_risk" | "completed" | "delayed";

interface DeliverableBase {
  id: string;
  label: string;
}

/** A fixed number of units contracted for the month, e.g. "Feed Design 10 / 14". */
export interface QuantityDeliverable extends DeliverableBase {
  kind: "quantity";
  completed: number;
  target: number;
}

/** A soft ceiling, not a mandatory target, e.g. "Instagram Stories 18 / up to 30". */
export interface UpToDeliverable extends DeliverableBase {
  kind: "up_to";
  used: number;
  max: number;
}

export interface RecurringPeriod {
  label: string;
  status: "done" | "in_progress" | "upcoming";
}

/** A cadence-based deliverable, e.g. weekly campaign optimization. */
export interface RecurringDeliverable extends DeliverableBase {
  kind: "recurring";
  periods: RecurringPeriod[];
}

export interface MilestoneStep {
  label: string;
  status: "done" | "in_progress" | "pending";
  pct?: number;
}

/** A sequence of steps toward one outcome, e.g. a website build. */
export interface MilestoneDeliverable extends DeliverableBase {
  kind: "milestone";
  milestones: MilestoneStep[];
}

/** A single artifact produced once a month, e.g. the monthly report. */
export interface MonthlyDeliverable extends DeliverableBase {
  kind: "monthly";
  status: "preparing" | "done" | "pending";
  note?: string;
}

export type Deliverable =
  | QuantityDeliverable
  | UpToDeliverable
  | RecurringDeliverable
  | MilestoneDeliverable
  | MonthlyDeliverable;

export interface DeliveryGroup {
  /** Service line label, e.g. "Social Media" — display-only, never branched on. */
  serviceGroup: string;
  deliverables: Deliverable[];
}

export interface MonthlyDelivery {
  periodLabel: string;
  overallPct: number;
  status: DeliveryStatus;
  groups: DeliveryGroup[];
}

/** Compact per-service status line for the Overview's "Current Work" section. */
export interface CurrentWorkItem {
  id: string;
  serviceGroup: string;
  detail: string;
  status: string;
}

// Role architecture — disiapkan untuk pemisahan Client vs Admin nanti.
// Belum ada UI Admin di MVP ini (lihat README), tapi tipe ini jadi dasar
// supaya penambahan /admin/* nanti tidak perlu migrasi ulang skema.
export type UserRole = "client" | "admin";
