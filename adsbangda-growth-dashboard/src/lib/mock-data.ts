// Data contoh untuk mode demo (dipakai kalau env Supabase belum di-set).
// Struktur & nama field SENGAJA sama persis dengan yang akan datang dari
// Supabase nanti (lihat lib/types.ts + supabase/migrations/0001_init.sql).

import type {
  Client,
  Project,
  ProjectTask,
  PerformanceMetric,
  ChannelSummary,
  ContentItem,
  ReportItem,
  AttentionItem,
} from "./types";

export const mockClient: Client = {
  id: "client_amati_coffee",
  name: "Amati Coffee",
  industry: "F&B — Coffee Shop",
  status: "active",
};

export const mockProjects: Project[] = [
  {
    id: "proj_aug_2026",
    clientId: mockClient.id,
    name: "August Campaign",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    status: "on_track",
  },
];

export const mockProjectTasks: ProjectTask[] = [
  { id: "t1", projectId: "proj_aug_2026", name: "Strategy", status: "done", progressPct: 100, orderIndex: 1, owner: "Rani — Strategist", dueDate: "2026-08-04" },
  { id: "t2", projectId: "proj_aug_2026", name: "Content Production", status: "in_progress", progressPct: 80, orderIndex: 2, owner: "Diko — Content Lead", dueDate: "2026-08-11" },
  { id: "t3", projectId: "proj_aug_2026", name: "Client Approval", status: "waiting", progressPct: 0, orderIndex: 3, owner: "Amati Coffee", dueDate: "2026-08-12", blocker: "6 konten menunggu approval kamu" },
  { id: "t4", projectId: "proj_aug_2026", name: "Publishing", status: "not_started", progressPct: 0, orderIndex: 4, owner: "Diko — Content Lead", dueDate: "2026-08-14" },
  { id: "t5", projectId: "proj_aug_2026", name: "Reporting", status: "not_started", progressPct: 0, orderIndex: 5, owner: "Rani — Strategist", dueDate: "2026-09-02" },
];

export const mockAttentionItems: AttentionItem[] = [
  {
    id: "a1",
    title: "6 konten menunggu approval",
    description: "Review konten Instagram minggu ini sebelum jadwal publish 12 Agustus.",
    dueLabel: "Hari ini",
    actionLabel: "Review Konten",
    actionHref: "/content-calendar",
    urgent: true,
  },
  {
    id: "a2",
    title: "Konfirmasi budget Meta Ads September",
    description: "Tim strategist mengusulkan kenaikan budget 15% berdasarkan performa CPL yang membaik.",
    dueLabel: "12 Agustus",
    actionLabel: "Lihat Detail",
    actionHref: "/performance",
    urgent: false,
  },
  {
    id: "a3",
    title: "Sync bulanan dengan tim Adsbangda",
    description: "Pembahasan hasil Agustus dan rencana campaign September.",
    dueLabel: "15 Agustus · 14:00",
    actionLabel: "Lihat Agenda",
    actionHref: "/reports",
    urgent: false,
  },
];

// Snapshot mingguan — dipakai untuk chart trend & perbandingan periode.
export const mockPerformance: PerformanceMetric[] = [
  { id: "m1", clientId: mockClient.id, date: "2026-07-06", channel: "meta_ads", spend: 3200000, reach: 42000, impressions: 61000, clicks: 980, leads: 41, costPerLead: 78048 },
  { id: "m2", clientId: mockClient.id, date: "2026-07-13", channel: "meta_ads", spend: 3400000, reach: 45500, impressions: 66000, clicks: 1040, leads: 47, costPerLead: 72340 },
  { id: "m3", clientId: mockClient.id, date: "2026-07-20", channel: "meta_ads", spend: 3350000, reach: 44200, impressions: 63500, clicks: 1005, leads: 44, costPerLead: 76136 },
  { id: "m4", clientId: mockClient.id, date: "2026-07-27", channel: "meta_ads", spend: 3600000, reach: 49800, impressions: 71200, clicks: 1150, leads: 53, costPerLead: 67924 },
  { id: "m5", clientId: mockClient.id, date: "2026-08-03", channel: "meta_ads", spend: 3750000, reach: 52100, impressions: 74800, clicks: 1210, leads: 58, costPerLead: 64655 },
];

export const mockSocial: PerformanceMetric[] = [
  { id: "s1", clientId: mockClient.id, date: "2026-07-06", channel: "social", followers: 18200, engagementRate: 3.1, reach: 38000 },
  { id: "s2", clientId: mockClient.id, date: "2026-07-13", channel: "social", followers: 18450, engagementRate: 3.4, reach: 40500 },
  { id: "s3", clientId: mockClient.id, date: "2026-07-20", channel: "social", followers: 18700, engagementRate: 3.2, reach: 39800 },
  { id: "s4", clientId: mockClient.id, date: "2026-07-27", channel: "social", followers: 19050, engagementRate: 3.8, reach: 44200 },
  { id: "s5", clientId: mockClient.id, date: "2026-08-03", channel: "social", followers: 19400, engagementRate: 4.1, reach: 47600 },
];

export const mockWebsite: PerformanceMetric[] = [
  { id: "w1", clientId: mockClient.id, date: "2026-07-06", channel: "website", visitors: 5200, conversions: 61 },
  { id: "w2", clientId: mockClient.id, date: "2026-07-13", channel: "website", visitors: 5600, conversions: 68 },
  { id: "w3", clientId: mockClient.id, date: "2026-07-20", channel: "website", visitors: 5450, conversions: 63 },
  { id: "w4", clientId: mockClient.id, date: "2026-07-27", channel: "website", visitors: 6100, conversions: 79 },
  { id: "w5", clientId: mockClient.id, date: "2026-08-03", channel: "website", visitors: 6480, conversions: 88 },
];

export const mockChannelSummary: ChannelSummary[] = [
  { channel: "Meta Ads", spend: 3750000, leads: 58, costPerLead: 64655, engagementRate: 2.8, status: "healthy" },
  { channel: "Instagram Organic", spend: 0, leads: 14, costPerLead: 0, engagementRate: 4.1, status: "healthy" },
  { channel: "Facebook Organic", spend: 0, leads: 3, costPerLead: 0, engagementRate: 1.2, status: "watch" },
  { channel: "Website Direct", spend: 0, leads: 9, costPerLead: 0, engagementRate: 1.6, status: "underperforming" },
];

export const mockTopContent = [
  { title: "Reel: \"5 cara bikin cold brew di rumah\"", reach: 84200, engagementRate: 6.4 },
  { title: "Carousel: Menu baru bulan Agustus", reach: 51300, engagementRate: 4.9 },
  { title: "Story takeover: Behind the scenes roasting", reach: 33800, engagementRate: 5.8 },
];

export const mockContentCalendar: ContentItem[] = [
  { id: "c1", clientId: mockClient.id, title: "Proses roasting biji kopi", plannedDate: "2026-08-08", status: "published", platform: "instagram", type: "reel" },
  { id: "c2", clientId: mockClient.id, title: "Promo weekday 20%", plannedDate: "2026-08-11", status: "scheduled", platform: "instagram", type: "carousel" },
  { id: "c3", clientId: mockClient.id, title: "Q&A barista", plannedDate: "2026-08-13", status: "approved", platform: "instagram", type: "story" },
  { id: "c4", clientId: mockClient.id, title: "Menu musiman baru", plannedDate: "2026-08-15", status: "waiting_approval", platform: "instagram", type: "reel" },
  { id: "c5", clientId: mockClient.id, title: "Testimoni pelanggan", plannedDate: "2026-08-18", status: "waiting_approval", platform: "facebook", type: "post" },
  { id: "c6", clientId: mockClient.id, title: "Tips menyimpan kopi di rumah", plannedDate: "2026-08-20", status: "in_production", platform: "instagram", type: "carousel" },
  { id: "c7", clientId: mockClient.id, title: "Cerita asal biji kopi lokal", plannedDate: "2026-08-22", status: "draft", platform: "website", type: "article" },
];

export const mockReports: ReportItem[] = [
  { id: "r1", clientId: mockClient.id, periodMonth: "2026-07", fileUrl: "#", generatedAt: "2026-08-02", summary: "Leads naik 18%, CPL turun 9% dibanding Juni." },
  { id: "r2", clientId: mockClient.id, periodMonth: "2026-06", fileUrl: "#", generatedAt: "2026-07-02", summary: "Engagement rate meningkat berkat konten reel baru." },
  { id: "r3", clientId: mockClient.id, periodMonth: "2026-05", fileUrl: "#", generatedAt: "2026-06-02", summary: "Awal campaign Meta Ads, fokus di brand awareness." },
];

export const marketingInsight =
  "Lead generation naik 9,2% minggu ini sementara cost per lead turun 12% — Meta Ads jadi kanal akuisisi paling efisien saat ini. Instagram organic juga mulai berkontribusi lewat konten reel behind-the-scenes.";
