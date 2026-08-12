-- ============================================================================
-- AdsBangda Growth Dashboard — Phase 3B: Goals module extension
-- ============================================================================
-- Jalankan SETELAH 0001-0006 lewat SQL Editor Supabase project kamu.
--
-- Additive saja — tabel `client_goals` (dibuat di migration 0006) tetap
-- dipakai apa adanya, cuma ditambah kolom yang dibutuhkan Phase 3B supaya
-- Goals bisa jadi "business outcome module" (description, status, notes).
-- Tidak ada tabel baru, tidak ada data lama yang hilang.
-- ============================================================================

alter table client_goals add column if not exists description text;
alter table client_goals add column if not exists notes text;
alter table client_goals add column if not exists status text not null default 'on_track'
  check (status in ('draft', 'on_track', 'at_risk', 'completed', 'archived'));
