// Data contoh untuk mode demo (dipakai kalau env Supabase belum di-set).
// Struktur & nama field SENGAJA sama persis dengan yang akan datang dari
// Supabase nanti (lihat lib/types.ts + supabase/migrations/0001_init.sql),
// supaya nanti tinggal ganti "getX()" ini isinya jadi query Supabase tanpa
// mengubah komponen UI sama sekali.

import type {
  Client,
  Project,
  ProjectTask,
  PerformanceMetric,
  ContentItem,
  ReportItem,
  UpcomingTask,
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
    name: "Campaign August 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    status: "active",
  },
];

export const mockProjectTasks: ProjectTask[] = [
  { id: "t1", projectId: "proj_aug_2026", name: "Strategy", status: "done", progressPct: 100, orderIndex: 1 },
  { id: "t2", projectId: "proj_aug_2026", name: "Content Production", status: "in_progress", progressPct: 80, orderIndex: 2 },
  { id: "t3", projectId: "proj_aug_2026", name: "Client Approval", status: "waiting", progressPct: 0, orderIndex: 3 },
  { id: "t4", projectId: "proj_aug_2026", name: "Publishing", status: "not_started", progressPct: 0, orderIndex: 4 },
];

export const mockUpcomingTasks: UpcomingTask[] = [
  { id: "u1", title: "Review 6 konten Instagram minggu ini", dueDate: "2026-08-10" },
  { id: "u2", title: "Approve budget Meta Ads September", dueDate: "2026-08-12" },
  { id: "u3", title: "Call sync bulanan dengan tim Adsbangda", dueDate: "2026-08-15" },
];

// Snapshot mingguan 6 minggu terakhir — dipakai untuk chart trend.
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

export const mockTopContent = [
  { title: "Reel: \"5 cara bikin cold brew di rumah\"", reach: 84200, engagementRate: 6.4 },
  { title: "Carousel: Menu baru bulan Agustus", reach: 51300, engagementRate: 4.9 },
  { title: "Story takeover: Behind the scenes roasting", reach: 33800, engagementRate: 5.8 },
];

export const mockContentCalendar: ContentItem[] = [
  { id: "c1", clientId: mockClient.id, title: "Reel: Proses roasting biji kopi", plannedDate: "2026-08-08", status: "published" },
  { id: "c2", clientId: mockClient.id, title: "Carousel: Promo weekday 20%", plannedDate: "2026-08-11", status: "scheduled" },
  { id: "c3", clientId: mockClient.id, title: "Story: Q&A barista", plannedDate: "2026-08-13", status: "approved" },
  { id: "c4", clientId: mockClient.id, title: "Reel: Menu musiman baru", plannedDate: "2026-08-15", status: "review" },
  { id: "c5", clientId: mockClient.id, title: "Post: Testimoni pelanggan", plannedDate: "2026-08-18", status: "draft" },
];

export const mockReports: ReportItem[] = [
  { id: "r1", clientId: mockClient.id, periodMonth: "2026-07", fileUrl: "#", generatedAt: "2026-08-02" },
  { id: "r2", clientId: mockClient.id, periodMonth: "2026-06", fileUrl: "#", generatedAt: "2026-07-02" },
  { id: "r3", clientId: mockClient.id, periodMonth: "2026-05", fileUrl: "#", generatedAt: "2026-06-02" },
];
