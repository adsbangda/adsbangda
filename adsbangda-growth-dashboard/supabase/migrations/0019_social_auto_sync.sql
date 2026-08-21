-- ============================================================================
-- AdsBangda Growth Dashboard — Social Auto-Sync (Instagram, Facebook, Threads)
-- ============================================================================
-- Jalankan SETELAH 0018_ga4_hostname_filter.sql.
--
-- Beda dengan GA4 (migration 0017/0018) yang pakai Service Account, Meta
-- (Instagram/Facebook/Threads) TIDAK butuh "robot" terpisah di server —
-- admin generate SATU access token per client+platform lewat Graph API
-- Explorer / Business Login for Instagram (di luar aplikasi ini), lalu
-- paste ke Admin Portal — mirip cara isi GA4 Property ID, cuma yang
-- ditempel di sini adalah token, bukan cuma ID.
--
-- social_connections — SATU baris per (client, platform). Menyimpan
--   access token (SENSITIF) + ID akun eksternal (IG Business Account ID /
--   Facebook Page ID / Threads User ID) + kapan tokennya expire (kalau
--   ada — Page Access Token biasanya tidak pernah expire, Threads token
--   expire 60 hari & perlu di-refresh berkala oleh cron).
--
--   RLS SENGAJA diaktifkan TANPA policy sama sekali (default Postgres =
--   DENY ALL utk anon & authenticated role manapun, termasuk admin yang
--   login lewat Supabase Auth biasa) — tabel ini HANYA PERNAH diakses
--   lewat service-role client (`createAdminClient()`, lihat
--   src/lib/supabase/admin-client.ts, bypass RLS total) di dalam Server
--   Action yang sudah melewati `requireAdmin()` sendiri di level aplikasi.
--   Access token di baris ini tidak pernah lewat jalur yang bisa dicapai
--   browser/anon key sama sekali, beda dengan tabel lain yang biasanya
--   punya SELECT policy buat client portal.
--
-- performance_metrics.source — sudah ada sejak migration 0017 ('manual'/
--   'ga4'), sekarang ditambah nilai 'meta' buat baris yang diisi otomatis
--   dari sync Instagram/Facebook/Threads. Pola "jangan pernah timpa baris
--   manual" yang sama persis dipakai di sini.
--
-- post_performance.source + external_post_id — post_performance
--   (migration 0015) sebelumnya cuma diisi manual per postingan. Sekarang
--   ditambah `source` ('manual'/'meta') dan `external_post_id` (ID media
--   asli dari Meta) supaya sync bisa tahu "postingan ini sudah pernah
--   disync sebelumnya, UPDATE aja" tanpa bikin duplikat, dan tanpa pernah
--   menimpa postingan yang admin tambahkan manual.
-- ============================================================================

alter table performance_metrics drop constraint if exists performance_metrics_source_check;
alter table performance_metrics add constraint performance_metrics_source_check
  check (source in ('manual', 'ga4', 'meta'));

alter table post_performance add column if not exists source text not null default 'manual'
  check (source in ('manual', 'meta'));
alter table post_performance add column if not exists external_post_id text;

create index if not exists post_performance_external_id_idx
  on post_performance (client_id, platform, external_post_id);

create table if not exists social_connections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'threads')),
  external_account_id text not null,
  access_token text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  unique (client_id, platform)
);

alter table social_connections enable row level security;
