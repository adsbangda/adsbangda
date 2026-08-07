// Tipe data ini merefleksikan skema database di supabase/migrations/0001_init.sql.
// Dipakai bersama oleh mock-data.ts (mode demo) dan query Supabase (mode live),
// jadi UI tidak perlu tahu datanya datang dari mock atau database sungguhan.

export type TaskStatus = "not_started" | "in_progress" | "waiting" | "done";
export type ContentStatus = "draft" | "review" | "approved" | "scheduled" | "published";
export type Channel = "meta_ads" | "social" | "website";

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
  status: "active" | "completed" | "on_hold";
}

export interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  progressPct: number;
  orderIndex: number;
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

export interface ContentItem {
  id: string;
  clientId: string;
  title: string;
  plannedDate: string;
  status: ContentStatus;
  notes?: string;
}

export interface ReportItem {
  id: string;
  clientId: string;
  periodMonth: string; // contoh: "2026-08"
  fileUrl: string;
  generatedAt: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
}
