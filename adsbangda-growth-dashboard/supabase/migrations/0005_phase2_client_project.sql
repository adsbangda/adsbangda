-- ============================================================================
-- AdsBangda Growth Dashboard — Phase 2: Client & Project Management
-- ============================================================================
-- Jalankan SETELAH 0001-0004 lewat SQL Editor Supabase project kamu.
--
-- Isi migration ini:
--   1. clients: kolom baru (website, description, updated_at) + status
--      'archived' ditambahkan ke check constraint (arsip, bukan hard delete).
--   2. projects: kolom baru (organization_id, type, description,
--      progress_pct, stage, updated_at). PENTING — `stage` ini BEDA dengan
--      kolom `status` yang sudah ada: `status` (on_track/at_risk/...) tetap
--      dipakai apa adanya oleh Client Portal (health indicator satu project
--      aktif yang ditampilkan ke client). `stage` (planning/active/...) baru,
--      khusus dipakai Admin Portal untuk lifecycle management multi-project.
--      Keduanya sengaja dipisah supaya tidak ada breaking change ke Client
--      Portal yang sudah jalan.
--   3. Tabel baru client_assignments & project_assignments — relational,
--      BUKAN hardcoded. Role TIDAK disimpan dobel di tabel ini; role selalu
--      dibaca live dari profiles.role (satu sumber kebenaran), supaya tidak
--      ada risiko out-of-sync.
--   4. Trigger validasi role di level DATABASE (bukan cuma frontend) —
--      client_assignments cuma boleh diisi user role account_manager/
--      admin/super_admin; project_assignments boleh account_manager/
--      creative/admin/super_admin. Trigger ini jalan SIAPAPUN yang insert
--      (termasuk kalau ada bug di frontend/admin-data.ts), jadi validasi
--      benar-benar di backend/database sesuai arahan.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLIENTS — kolom baru + status 'archived'
-- ----------------------------------------------------------------------------

alter table clients add column if not exists website text;
alter table clients add column if not exists description text;
alter table clients add column if not exists updated_at timestamptz not null default now();

alter table clients drop constraint if exists clients_status_check;
alter table clients add constraint clients_status_check
  check (status in ('active', 'paused', 'onboarding', 'archived'));

-- ----------------------------------------------------------------------------
-- 2. PROJECTS — kolom baru (lihat catatan `stage` vs `status` di atas)
-- ----------------------------------------------------------------------------

alter table projects add column if not exists organization_id uuid references organizations (id);
update projects p set organization_id = c.organization_id
  from clients c where c.id = p.client_id and p.organization_id is null;
alter table projects alter column organization_id set not null;
alter table projects alter column organization_id set default default_organization_id();

alter table projects add column if not exists type text not null default 'other';
alter table projects add column if not exists description text;
alter table projects add column if not exists progress_pct int not null default 0 check (progress_pct between 0 and 100);
alter table projects add column if not exists stage text not null default 'planning'
  check (stage in ('planning', 'active', 'on_hold', 'completed', 'archived'));
alter table projects add column if not exists updated_at timestamptz not null default now();

-- ----------------------------------------------------------------------------
-- 3. CLIENT_ASSIGNMENTS & PROJECT_ASSIGNMENTS — relational, bukan hardcode
-- ----------------------------------------------------------------------------

create table if not exists client_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create table if not exists project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

alter table client_assignments enable row level security;
alter table project_assignments enable row level security;

create policy "Admins can manage client_assignments" on client_assignments for all using (is_admin()) with check (is_admin());
create policy "Admins can manage project_assignments" on project_assignments for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 4. TRIGGER — validasi role di level database (defense in depth)
-- ----------------------------------------------------------------------------

create or replace function validate_client_assignment_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles
    where profiles.id = new.user_id
      and profiles.role in ('account_manager', 'admin', 'super_admin')
  ) then
    raise exception 'user % tidak punya role yang valid untuk client assignment (harus account_manager/admin/super_admin)', new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_client_assignment on client_assignments;
create trigger trg_validate_client_assignment
  before insert or update on client_assignments
  for each row execute function validate_client_assignment_role();

create or replace function validate_project_assignment_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles
    where profiles.id = new.user_id
      and profiles.role in ('account_manager', 'creative', 'admin', 'super_admin')
  ) then
    raise exception 'user % tidak punya role yang valid untuk project assignment (harus account_manager/creative/admin/super_admin)', new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_project_assignment on project_assignments;
create trigger trg_validate_project_assignment
  before insert or update on project_assignments
  for each row execute function validate_project_assignment_role();

-- ----------------------------------------------------------------------------
-- 5. RPC — daftar "last activity" ringkas per client (dipakai Client List)
-- ----------------------------------------------------------------------------

create or replace function admin_client_last_activity()
returns table (client_id uuid, last_activity timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select client_id, max(occurred_at) as last_activity
  from activity_log
  where is_admin()
  group by client_id;
$$;

grant execute on function admin_client_last_activity() to authenticated;
