-- ============================================================================
-- AdsBangda Growth Dashboard — Workflow & IA Refactor
-- ============================================================================
-- Jalankan SETELAH 0001-0008.
--
--   1. clients: +3 boolean service flag (dipakai untuk tahu layanan apa yang
--      aktif untuk client ini — dasar buat Reports nanti tahu section mana
--      yang perlu ditampilkan, dan buat Admin tahu tab mana yang relevan).
--   2. content_approval_history — riwayat approval TIDAK overwrite lagi.
--      content_items.approval_status tetap ada sebagai status TERKINI.
--   3. performance_metrics: +target_leads (opsional, cuma dipakai channel
--      meta_ads) — kalau diisi, Meta Ads bisa tampilkan "Goal Achievement %"
--      TANPA memaksa semua client punya target.
-- ============================================================================

alter table clients add column if not exists social_media_active boolean not null default false;
alter table clients add column if not exists meta_ads_active boolean not null default false;
alter table clients add column if not exists website_active boolean not null default false;

create table if not exists content_approval_history (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content_items (id) on delete cascade,
  action text not null check (action in ('submitted', 'approved', 'revision_requested', 'note')),
  note text not null default '',
  actor text not null default '', -- nama/role penulis, bebas teks (belum linked ke user_id)
  created_at timestamptz not null default now()
);

alter table content_approval_history enable row level security;
create policy "Client members can view their own content approval history"
  on content_approval_history for select
  using (content_id in (select id from content_items where client_id in (
    select client_id from client_users where user_id = auth.uid()
  )));
create policy "Admins can manage content_approval_history" on content_approval_history for all using (is_admin()) with check (is_admin());

alter table performance_metrics add column if not exists target_leads numeric;
