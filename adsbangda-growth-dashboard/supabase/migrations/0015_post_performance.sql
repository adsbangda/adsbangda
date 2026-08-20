-- ============================================================================
-- AdsBangda Growth Dashboard — Post Performance (Post Ranking per Platform)
-- ============================================================================
-- Jalankan SETELAH 0001-0014 lewat SQL Editor Supabase project kamu.
--
-- Tabel baru: `post_performance` — satu baris per POSTINGAN (bukan snapshot
-- agregat platform seperti `performance_metrics`), dengan metriknya sendiri:
-- likes, comments, shares, saves, views. Ini sumber data buat tabel
-- "Post Ranking" per platform di halaman Social Media (Client Portal),
-- yang menggantikan section "Engagement per Platform" (ChannelOverview)
-- yang lama supaya tidak dobel dengan KPI di atasnya.
--
-- RLS mengikuti pola yang sama persis dengan client_goals (migration 0006):
-- client cuma boleh SELECT baris client_id miliknya sendiri, admin boleh
-- kelola semua (insert/update/delete) client mana pun.
-- ============================================================================

create table if not exists post_performance (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  platform text not null,
  type text not null,
  title text not null default '',
  posted_date date not null default current_date,
  likes numeric,
  comments numeric,
  shares numeric,
  saves numeric,
  views numeric,
  permalink text,
  created_at timestamptz not null default now()
);

alter table post_performance enable row level security;

create policy "Client members can view their own post_performance" on post_performance for select using (is_member_of_client(client_id));
create policy "Admins can manage post_performance" on post_performance for all using (is_admin()) with check (is_admin());

-- Realtime — supaya Post Ranking ikut Live Sync (lihat 0011_realtime.sql)
-- tanpa perlu refresh manual begitu admin tambah/edit/hapus postingan.
alter table post_performance replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'post_performance'
  ) then
    alter publication supabase_realtime add table post_performance;
  end if;
end $$;
