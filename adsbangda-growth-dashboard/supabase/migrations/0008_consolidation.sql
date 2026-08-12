-- ============================================================================
-- AdsBangda Growth Dashboard — Navigation & Data Consolidation
-- ============================================================================
-- Jalankan SETELAH 0001-0007 lewat SQL Editor Supabase project kamu.
--
-- Isi migration ini:
--   1. performance_metrics: kolom `platform` (untuk bedakan Instagram/
--      Facebook/TikTok/X/LinkedIn/Threads di channel='social') + kolom baru
--      untuk Website (page_views, sessions, bounce_rate, avg_session_duration)
--      dan Meta Ads (ctr, cpc, roas — sekarang input manual admin, BUKAN
--      dihitung otomatis, sesuai instruksi terbaru). Semua kolom baru
--      NULLABLE, tidak mengubah data lama sama sekali.
--   2. content_items: tambah asset_url, publish_link, approval_required,
--      approval_status — mendukung form Content Entry yang lebih lengkap.
--   3. Tabel baru content_targets — target content per client+period+
--      platform+content_type (dasar hitung Content Delivery progress).
--   4. Tabel baru website_activity — activity feed khusus modul Website.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PERFORMANCE_METRICS — platform-aware + kolom Website & Meta Ads baru
-- ----------------------------------------------------------------------------

alter table performance_metrics add column if not exists platform text;
alter table performance_metrics drop constraint if exists performance_metrics_platform_check;
alter table performance_metrics add constraint performance_metrics_platform_check
  check (platform is null or platform in ('instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'threads'));

alter table performance_metrics add column if not exists page_views int;
alter table performance_metrics add column if not exists sessions int;
alter table performance_metrics add column if not exists bounce_rate numeric;
alter table performance_metrics add column if not exists avg_session_duration text;

alter table performance_metrics add column if not exists ctr numeric;
alter table performance_metrics add column if not exists cpc numeric;
alter table performance_metrics add column if not exists roas numeric;

-- Catatan: unique constraint per client+channel+platform+date SENGAJA tidak
-- ditambahkan di sini untuk menghindari migration gagal kalau kebetulan
-- sudah ada data duplikat dari eksperimen sebelumnya. Pencegahan duplikat
-- cukup dilakukan di level aplikasi (admin-data.ts) untuk saat ini.

-- ----------------------------------------------------------------------------
-- 2. CONTENT_ITEMS — asset, publish link, approval (opsional)
-- ----------------------------------------------------------------------------

alter table content_items add column if not exists asset_url text;
alter table content_items add column if not exists publish_link text;
alter table content_items add column if not exists approval_required boolean not null default false;
alter table content_items add column if not exists approval_status text;
alter table content_items drop constraint if exists content_items_approval_status_check;
alter table content_items add constraint content_items_approval_status_check
  check (approval_status is null or approval_status in ('pending', 'approved', 'revision'));

-- Perluas platform content_items supaya konsisten dengan platform Social Media
-- yang didukung (Instagram/Facebook/TikTok/X/LinkedIn/Threads), plus 'website'
-- untuk artikel/blog seperti sebelumnya.
alter table content_items drop constraint if exists content_items_platform_check;
alter table content_items add constraint content_items_platform_check
  check (platform is null or platform in ('instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'threads', 'website'));

-- Perluas content type — pertahankan nilai lama (reel/carousel/story/post/
-- article) SEKALIGUS tambah kosakata baru (feed/reels/video) yang dipakai
-- form Content Entry konsolidasi, supaya tidak ada data lama yang invalid.
alter table content_items drop constraint if exists content_items_type_check;
alter table content_items add constraint content_items_type_check
  check (type is null or type in ('reel', 'reels', 'carousel', 'feed', 'story', 'video', 'post', 'article'));

-- ----------------------------------------------------------------------------
-- 3. CONTENT_TARGETS — target kontrak per client+period+platform+type
-- ----------------------------------------------------------------------------

create table if not exists content_targets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period text not null, -- 'YYYY-MM'
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'threads')),
  content_type text not null, -- feed/reels/story/video/post — fleksibel per platform
  target int not null default 0,
  created_at timestamptz not null default now(),
  unique (client_id, period, platform, content_type)
);

alter table content_targets enable row level security;
create policy "Client members can view their own content targets" on content_targets for select using (is_member_of_client(client_id));
create policy "Admins can manage content_targets" on content_targets for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 4. WEBSITE_ACTIVITY — activity feed khusus modul Website
-- ----------------------------------------------------------------------------

create table if not exists website_activity (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  activity_date date not null,
  title text not null,
  description text not null default '',
  status text not null default 'done' check (status in ('done', 'in_progress', 'planned')),
  created_at timestamptz not null default now()
);

alter table website_activity enable row level security;
create policy "Client members can view their own website activity" on website_activity for select using (is_member_of_client(client_id));
create policy "Admins can manage website_activity" on website_activity for all using (is_admin()) with check (is_admin());
