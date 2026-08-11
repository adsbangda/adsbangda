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
