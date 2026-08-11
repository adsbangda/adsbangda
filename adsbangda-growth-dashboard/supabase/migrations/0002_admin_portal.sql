-- ============================================================================
-- AdsBangda Growth Dashboard — Admin Portal & Schema Fixes
-- ============================================================================
-- Jalankan SETELAH 0001_init.sql lewat Supabase CLI (`supabase db push`)
-- atau paste langsung di SQL Editor project Supabase kamu.
--
-- Isi migration ini:
--   1. Perbaikan mismatch antara skema 0001 dan kode aplikasi (kolom yang
--      dipakai kode tapi belum ada di tabel, dan check-constraint yang belum
--      sinkron dengan status yang benar-benar dipakai UI).
--   2. Tabel `profiles` — menyimpan role (client/admin) tiap auth user.
--   3. Tabel-tabel baru yang mengisi Client Portal: delivery_meta,
--      delivery_items, quick_stats, channel_overview, upcoming_events,
--      attention_items, activity_log, files.
--   4. RLS: client tetap read-only ke datanya sendiri, admin (is_admin())
--      punya akses penuh ke SEMUA tabel client-facing.
--   5. Fungsi RPC aman (security definer + cek is_admin() di dalamnya) untuk
--      Admin Portal mengelola akses user tanpa perlu service_role key sama
--      sekali — cukup anon/authenticated key yang sama dengan client app.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PERBAIKAN SKEMA 0001
-- ----------------------------------------------------------------------------

-- content_items: kode (lib/types.ts ContentItem) pakai kolom `platform` dan
-- `type` yang belum ada di tabel, dan status yang tidak cocok dengan check
-- constraint lama. Perbaiki keduanya.
alter table content_items
  add column if not exists platform text,
  add column if not exists type text;

alter table content_items drop constraint if exists content_items_status_check;
alter table content_items add constraint content_items_status_check
  check (status in ('draft', 'in_production', 'waiting_approval', 'approved', 'scheduled', 'published'));

alter table content_items add constraint content_items_platform_check
  check (platform is null or platform in ('instagram', 'facebook', 'tiktok', 'website'));

alter table content_items add constraint content_items_type_check
  check (type is null or type in ('reel', 'carousel', 'story', 'post', 'article'));

-- projects: status di kode (lib/types.ts Project) pakai 'on_track' / 'at_risk',
-- bukan 'active' seperti check constraint lama.
alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in ('on_track', 'at_risk', 'completed', 'on_hold'));

alter table projects alter column status set default 'on_track';

-- project_tasks: kode (lib/types.ts ProjectTask) pakai owner/due_date/blocker
-- yang belum ada di tabel.
alter table project_tasks
  add column if not exists owner text not null default '',
  add column if not exists due_date date,
  add column if not exists blocker text;

-- reports: halaman Reports menampilkan ringkasan (`summary`) yang belum ada
-- kolomnya di tabel.
alter table reports
  add column if not exists summary text not null default '';

alter table reports alter column summary drop default;

-- ----------------------------------------------------------------------------
-- 2. PROFILES — role per auth user (client vs admin)
-- ----------------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (id = auth.uid());

-- Auto-buat baris profiles setiap ada auth user baru (default role: client,
-- BELUM terhubung ke client manapun sampai admin meng-assign lewat Team page).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper dipakai di semua policy admin di bawah.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. TABEL BARU — mengisi Client Portal (semua dikelola lewat Admin Portal)
-- ----------------------------------------------------------------------------

-- Ringkasan Monthly Delivery per client per periode ('YYYY-MM').
-- overall_pct DIHITUNG otomatis dari delivery_items (lihat fungsi di bawah),
-- bukan diketik manual, supaya tidak pernah nyimpang dari data aslinya.
create table if not exists delivery_meta (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period text not null,
  status text not null default 'on_track' check (status in ('on_track', 'at_risk', 'completed', 'delayed')),
  helper_text text not null default '',
  period_range text not null default '',
  last_updated text not null default '',
  agreed_date text not null default '',
  contract_href text not null default '/reports',
  created_at timestamptz not null default now(),
  unique (client_id, period)
);

create table if not exists delivery_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period text not null,
  icon text not null check (icon in ('calendar', 'instagram', 'facebook', 'tiktok', 'edit', 'megaphone', 'chart')),
  label text not null,
  completed int not null default 0,
  target int not null default 1,
  unit text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- View kecil untuk hitung overall_pct dari delivery_items — dipakai lib/data.ts
-- lewat select biasa (bukan RPC) supaya query tetap simpel.
create or replace view delivery_progress as
  select
    client_id,
    period,
    coalesce(round(avg(
      case when target > 0 then least(100, completed::numeric / target * 100) else 0 end
    )), 0)::int as overall_pct
  from delivery_items
  group by client_id, period;

create table if not exists quick_stats (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period text not null,
  icon text not null check (icon in ('send', 'story', 'heart', 'users')),
  label text not null,
  value text not null,
  delta_label text not null default '',
  delta_positive boolean not null default true,
  sort_order int not null default 0
);

create table if not exists channel_overview (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period text not null,
  icon text not null check (icon in ('instagram', 'facebook', 'tiktok', 'reach')),
  label text not null,
  metric_label text not null default '',
  value text not null,
  delta_label text not null default '',
  sparkline jsonb not null default '[]',
  sort_order int not null default 0
);

create table if not exists upcoming_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  event_date date not null,
  title text not null,
  time_label text not null default ''
);

create table if not exists attention_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  icon text not null check (icon in ('approval', 'budget', 'meeting')),
  title text not null,
  description text not null default '',
  href text not null default '/',
  count_badge int,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  day_label text not null,
  title text not null,
  description text not null default '',
  done boolean not null default true,
  thumbnail_count int,
  occurred_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  category text not null default '',
  file_url text not null,
  size_label text not null default '',
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — client read-only miliknya sendiri, admin bebas
-- ----------------------------------------------------------------------------

alter table delivery_meta enable row level security;
alter table delivery_items enable row level security;
alter table quick_stats enable row level security;
alter table channel_overview enable row level security;
alter table upcoming_events enable row level security;
alter table attention_items enable row level security;
alter table activity_log enable row level security;
alter table files enable row level security;

-- Client: SELECT saja, milik sendiri.
create policy "Client members can view their own delivery meta" on delivery_meta for select using (is_member_of_client(client_id));
create policy "Client members can view their own delivery items" on delivery_items for select using (is_member_of_client(client_id));
create policy "Client members can view their own quick stats" on quick_stats for select using (is_member_of_client(client_id));
create policy "Client members can view their own channel overview" on channel_overview for select using (is_member_of_client(client_id));
create policy "Client members can view their own upcoming events" on upcoming_events for select using (is_member_of_client(client_id));
create policy "Client members can view their own attention items" on attention_items for select using (is_member_of_client(client_id) and not resolved);
create policy "Client members can view their own activity log" on activity_log for select using (is_member_of_client(client_id));
create policy "Client members can view their own files" on files for select using (is_member_of_client(client_id));

-- Admin: bebas semua operasi, semua tabel client-facing (termasuk yang lama).
create policy "Admins can manage clients" on clients for all using (is_admin()) with check (is_admin());
create policy "Admins can manage client_users" on client_users for all using (is_admin()) with check (is_admin());
create policy "Admins can manage projects" on projects for all using (is_admin()) with check (is_admin());
create policy "Admins can manage project_tasks" on project_tasks for all using (is_admin()) with check (is_admin());
create policy "Admins can manage performance_metrics" on performance_metrics for all using (is_admin()) with check (is_admin());
create policy "Admins can manage content_items" on content_items for all using (is_admin()) with check (is_admin());
create policy "Admins can manage reports" on reports for all using (is_admin()) with check (is_admin());
create policy "Admins can manage delivery_meta" on delivery_meta for all using (is_admin()) with check (is_admin());
create policy "Admins can manage delivery_items" on delivery_items for all using (is_admin()) with check (is_admin());
create policy "Admins can manage quick_stats" on quick_stats for all using (is_admin()) with check (is_admin());
create policy "Admins can manage channel_overview" on channel_overview for all using (is_admin()) with check (is_admin());
create policy "Admins can manage upcoming_events" on upcoming_events for all using (is_admin()) with check (is_admin());
create policy "Admins can manage attention_items" on attention_items for all using (is_admin()) with check (is_admin());
create policy "Admins can manage activity_log" on activity_log for all using (is_admin()) with check (is_admin());
create policy "Admins can manage files" on files for all using (is_admin()) with check (is_admin());
create policy "Admins can view all profiles" on profiles for select using (is_admin());

-- ----------------------------------------------------------------------------
-- 5. FUNGSI RPC ADMIN — kelola akses user tanpa service_role key
-- ----------------------------------------------------------------------------

create or replace function admin_list_users()
returns table (id uuid, email text, role text, full_name text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, u.email, p.role, p.full_name, p.created_at
  from profiles p
  join auth.users u on u.id = p.id
  where is_admin()
  order by p.created_at desc;
$$;

create or replace function admin_list_client_access()
returns table (user_id uuid, email text, client_id uuid, client_name text, access_role text)
language sql
security definer
set search_path = public
stable
as $$
  select cu.user_id, u.email, cu.client_id, c.name, cu.role
  from client_users cu
  join auth.users u on u.id = cu.user_id
  join clients c on c.id = cu.client_id
  where is_admin()
  order by c.name;
$$;

create or replace function admin_set_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  if new_role not in ('client', 'admin') then
    raise exception 'invalid role';
  end if;
  update profiles set role = new_role where id = target_user_id;
end;
$$;

create or replace function admin_assign_client(target_user_id uuid, target_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  insert into client_users (user_id, client_id, role)
  values (target_user_id, target_client_id, 'owner')
  on conflict (user_id, client_id) do nothing;
end;
$$;

create or replace function admin_unassign_client(target_user_id uuid, target_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  delete from client_users where user_id = target_user_id and client_id = target_client_id;
end;
$$;

grant execute on function admin_list_users() to authenticated;
grant execute on function admin_list_client_access() to authenticated;
grant execute on function admin_set_role(uuid, text) to authenticated;
grant execute on function admin_assign_client(uuid, uuid) to authenticated;
grant execute on function admin_unassign_client(uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. BOOTSTRAP ADMIN PERTAMA (jalankan manual, lihat README)
-- ----------------------------------------------------------------------------
-- Trigger di atas selalu membuat user baru dengan role 'client'. Untuk
-- menjadikan seseorang admin pertama kali, daftar dulu lewat halaman /login,
-- lalu jalankan SQL berikut di SQL Editor Supabase (ganti email-nya):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'admin@adsbangda.com');
--
-- Setelah itu, admin tersebut bisa mempromosikan admin lain lewat halaman
-- /admin/team di aplikasi tanpa perlu SQL lagi.
