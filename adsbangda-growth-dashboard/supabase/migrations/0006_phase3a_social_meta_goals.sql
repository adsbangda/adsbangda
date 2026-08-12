-- ============================================================================
-- AdsBangda Growth Dashboard — Phase 3A: Client Data Center (Goals)
-- ============================================================================
-- Jalankan SETELAH 0001-0005 lewat SQL Editor Supabase project kamu.
--
-- Phase 3A ini murni soal INFORMATION ARCHITECTURE di Admin Portal (tab baru:
-- Social Media, Meta Ads, Goals; Content/Files/Reports dipisah jadi fokus
-- masing-masing). Social Media & Meta Ads REUSE tabel `performance_metrics`
-- yang sudah ada sejak migration 0001 (kolom `channel` sudah membedakan
-- 'social' vs 'meta_ads') — TIDAK ada tabel baru untuk itu, cukup ditambah
-- fungsi admin di admin-data.ts untuk menulis ke tabel yang sudah ada.
--
-- Satu-satunya tabel baru di migration ini: `client_goals`, untuk menu Goals
-- yang memang belum punya rumah di skema manapun sebelumnya.
-- ============================================================================

create table if not exists client_goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  label text not null,
  target numeric not null default 0,
  actual numeric not null default 0,
  unit text not null default '',
  period text not null default '', -- contoh: '2026-08'
  created_at timestamptz not null default now()
);

alter table client_goals enable row level security;

create policy "Client members can view their own goals" on client_goals for select using (is_member_of_client(client_id));
create policy "Admins can manage client_goals" on client_goals for all using (is_admin()) with check (is_admin());
