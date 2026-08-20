-- ============================================================================
-- AdsBangda Growth Dashboard — Service Catalog & Project Services/Period
-- ============================================================================
-- Jalankan SETELAH 0001-0015 lewat SQL Editor Supabase project kamu.
--
-- Latar belakang: sebelumnya satu project cuma bisa punya SATU "type" bebas
-- (social_media/meta_ads/website/branding/other) dan tidak punya konsep
-- "periode berjalan" sama sekali — admin juga tidak bisa update
-- tahapan/step project (project_tasks) lewat UI apa pun.
--
-- Migration ini menambah:
--   1. Tabel `services` — katalog layanan/paket agency, GLOBAL (bukan
--      per-client), dikelola BEBAS oleh admin (tambah/edit/hapus kapan
--      saja). Admin-only — client tidak pernah query tabel ini langsung.
--   2. Kolom `projects.services` (text[]) — LABEL layanan yang dipilih
--      untuk project ini, BOLEH lebih dari satu (mis. client ambil
--      "Social Media Management" + "Website & Landing Page" sekaligus
--      dalam SATU project/paket yang sama). Sengaja simpan teks label
--      langsung (bukan foreign key ke `services`) — supaya admin bebas
--      edit/hapus katalog kapan saja TANPA merusak data project yang
--      sudah ada.
--   3. Kolom `projects.period` (text, format "YYYY-MM") — periode
--      berjalan, diupdate admin tiap bulan begitu project di-roll ke
--      bulan berikutnya.
--
-- `project_tasks` TIDAK perlu migration baru — tabelnya dan policy
-- "Admins can manage project_tasks" (migration 0002) sudah cukup, admin
-- cuma belum punya UI buat tambah/edit/hapus task lewat Admin Portal
-- (sudah dilengkapi di kode, lihat adminCreateProjectTask dkk di
-- lib/admin-data.ts).
-- ============================================================================

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) default default_organization_id(),
  label text not null,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "Admins can manage services" on services for all using (is_admin()) with check (is_admin());

alter table projects add column if not exists services text[] not null default '{}';
alter table projects add column if not exists period text not null default to_char(current_date, 'YYYY-MM');
