-- ============================================================================
-- AdsBangda Growth Dashboard — Skema MVP
-- ============================================================================
-- Jalankan lewat Supabase CLI: supabase db push
-- atau paste langsung di SQL Editor project Supabase kamu.
--
-- Prinsip keamanan: SETIAP tabel yang menyimpan data client dilindungi RLS
-- (Row Level Security) berbasis client_id yang terhubung ke user yang
-- sedang login lewat tabel client_users. Ini memastikan client A TIDAK
-- PERNAH bisa membaca data client B, bahkan kalau ada bug di frontend.
-- ============================================================================

-- 1. CLIENTS ------------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  industry text,
  status text not null default 'active' check (status in ('active', 'paused', 'onboarding')),
  created_at timestamptz not null default now()
);

-- 2. CLIENT_USERS (relasi user auth -> client, mendukung multi-user per client) -
create table client_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

-- 3. PROJECTS -------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold')),
  created_at timestamptz not null default now()
);

-- 4. PROJECT_TASKS ----------------------------------------------------------
create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  name text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'waiting', 'done')),
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  order_index int not null default 0
);

-- 5. PERFORMANCE_METRICS ------------------------------------------------------
-- Snapshot periodik (mingguan/bulanan). Diinput manual oleh admin Adsbangda
-- untuk MVP; kolom sengaja generik per channel supaya nanti gampang diisi
-- otomatis lewat integrasi Meta Marketing API / Instagram Graph API.
create table performance_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  date date not null,
  channel text not null check (channel in ('meta_ads', 'social', 'website')),
  spend numeric,
  reach int,
  impressions int,
  clicks int,
  leads int,
  cost_per_lead numeric,
  followers int,
  engagement_rate numeric,
  visitors int,
  conversions int,
  created_at timestamptz not null default now()
);

-- 6. CONTENT_ITEMS ------------------------------------------------------------
create table content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  title text not null,
  planned_date date not null,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'scheduled', 'published')),
  notes text
);

-- 7. REPORTS --------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  period_month text not null, -- format 'YYYY-MM'
  file_url text not null,
  generated_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table clients enable row level security;
alter table client_users enable row level security;
alter table projects enable row level security;
alter table project_tasks enable row level security;
alter table performance_metrics enable row level security;
alter table content_items enable row level security;
alter table reports enable row level security;

-- Helper: cek apakah user yang login terhubung ke client_id tertentu.
create or replace function is_member_of_client(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from client_users
    where client_users.client_id = target_client_id
      and client_users.user_id = auth.uid()
  );
$$;

create policy "Client members can view their own client row"
  on clients for select
  using (is_member_of_client(id));

create policy "Users can view their own client_users row"
  on client_users for select
  using (user_id = auth.uid());

create policy "Client members can view their own projects"
  on projects for select
  using (is_member_of_client(client_id));

create policy "Client members can view their own project tasks"
  on project_tasks for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_tasks.project_id
        and is_member_of_client(projects.client_id)
    )
  );

create policy "Client members can view their own performance metrics"
  on performance_metrics for select
  using (is_member_of_client(client_id));

create policy "Client members can view their own content items"
  on content_items for select
  using (is_member_of_client(client_id));

create policy "Client members can view their own reports"
  on reports for select
  using (is_member_of_client(client_id));

-- Catatan: policy di atas hanya untuk SELECT (client cuma boleh lihat).
-- Semua INSERT/UPDATE/DELETE (input performance, update task, dsb) dilakukan
-- oleh tim internal Adsbangda lewat role terpisah (mis. service_role key di
-- admin tool internal, bukan lewat client app ini) — jadi sengaja TIDAK
-- dibuatkan policy insert/update untuk role client di sini.
