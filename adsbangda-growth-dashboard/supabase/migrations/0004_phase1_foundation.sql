-- ============================================================================
-- AdsBangda Growth Dashboard — Phase 1: Foundation (Multi-tenant + Roles)
-- ============================================================================
-- Jalankan SETELAH 0001, 0002, 0003 lewat Supabase CLI (`supabase db push`)
-- atau paste langsung di SQL Editor project Supabase kamu.
--
-- Isi migration ini (lihat laporan Phase 1 untuk konteks lengkap):
--   1. Tabel `organizations` — tenant tertinggi. Untuk sekarang cuma ada
--      SATU baris ("Adsbangda" sendiri), semua `clients` & `profiles`
--      dihubungkan ke situ. Ini bukan perubahan perilaku — cuma menyiapkan
--      kolom & FK supaya kalau suatu saat platform ini dipakai lebih dari
--      satu agency (white-label), tidak perlu migrasi ulang skema dari nol.
--   2. Perluasan role dari 2 nilai (client/admin) jadi 5:
--      super_admin, admin, account_manager, creative, client.
--   3. Helper baru `is_staff()` (role apa pun selain 'client') disiapkan
--      untuk kebutuhan RLS granular di fase berikutnya — belum dipakai di
--      policy manapun sekarang supaya scope Phase 1 tetap kecil.
--   4. `is_admin()` didefinisikan ulang jadi (super_admin ATAU admin), jadi
--      SEMUA policy existing yang sudah memanggil is_admin() otomatis ikut
--      berlaku ke super_admin juga — tidak perlu tulis ulang satu-satu.
--   5. Guard privilege-escalation: hanya super_admin yang boleh menaikkan
--      seseorang jadi super_admin/admin lewat admin_set_role().
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ORGANIZATIONS — tenant tertinggi (agency-level), disiapkan untuk masa depan
-- ----------------------------------------------------------------------------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into organizations (name, slug)
  values ('Adsbangda', 'adsbangda')
  on conflict (slug) do nothing;

alter table clients add column if not exists organization_id uuid references organizations (id);
alter table profiles add column if not exists organization_id uuid references organizations (id);

update clients set organization_id = (select id from organizations where slug = 'adsbangda')
  where organization_id is null;
update profiles set organization_id = (select id from organizations where slug = 'adsbangda')
  where organization_id is null;

alter table clients alter column organization_id set not null;
alter table profiles alter column organization_id set not null;

-- PostgreSQL tidak mengizinkan subquery langsung di DEFAULT expression —
-- perlu dibungkus fungsi dulu.
create or replace function default_organization_id()
returns uuid
language sql
stable
as $$
  select id from organizations where slug = 'adsbangda' limit 1;
$$;

alter table clients alter column organization_id set default default_organization_id();
alter table profiles alter column organization_id set default default_organization_id();

alter table organizations enable row level security;

-- Belum ada UI multi-organization, tapi baris ini tetap harus bisa dibaca
-- oleh siapa pun yang sudah figure keluar id-nya lewat client/profile mereka
-- sendiri (bukan exposed publicly).
create policy "Members can view their own organization"
  on organizations for select
  using (
    id in (select organization_id from profiles where profiles.id = auth.uid())
    or id in (
      select c.organization_id from clients c
      join client_users cu on cu.client_id = c.id
      where cu.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 2. PERLUASAN ROLE — 5 nilai, backward compatible dengan data lama
-- ----------------------------------------------------------------------------

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'account_manager', 'creative', 'client'));

-- ----------------------------------------------------------------------------
-- 3. HELPER ROLE — is_staff() baru, is_admin()/is_super_admin() diperluas
-- ----------------------------------------------------------------------------

create or replace function is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  );
$$;

-- PENTING: definisi ulang ini otomatis memperluas SEMUA policy lama yang
-- sudah memanggil is_admin() (lihat 0002_admin_portal.sql) — tidak perlu
-- menulis ulang satu-satu.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role in ('super_admin', 'admin')
  );
$$;

-- Disiapkan untuk RLS granular per role di fase berikutnya (belum dipakai
-- di policy manapun di migration ini — scope Phase 1 sengaja dibatasi).
create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin', 'account_manager', 'creative')
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. GUARD PRIVILEGE ESCALATION — hanya super_admin boleh assign admin-tier
-- ----------------------------------------------------------------------------

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
  if new_role not in ('super_admin', 'admin', 'account_manager', 'creative', 'client') then
    raise exception 'invalid role';
  end if;
  if new_role in ('super_admin', 'admin') and not is_super_admin() then
    raise exception 'only super_admin can grant admin-tier roles';
  end if;
  update profiles set role = new_role where id = target_user_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. BOOTSTRAP: promosikan admin pertama yang sudah ada jadi super_admin
-- ----------------------------------------------------------------------------
-- Supaya tidak ada yang "terkunci" habis migration ini jalan (semua admin
-- existing masih role 'admin', dan sesuai guard di atas cuma super_admin
-- yang boleh assign admin-tier). Jalankan manual kalau perlu ganti orangnya:
--
--   update public.profiles set role = 'super_admin'
--   where id = (select id from auth.users where email = 'admin@adsbangda.com');
--
-- Default aman: SEMUA user yang sudah role 'admin' saat migration ini
-- dijalankan otomatis dinaikkan jadi 'super_admin', supaya tidak ada admin
-- existing yang kehilangan kemampuan mengelola role user lain.
update profiles set role = 'super_admin' where role = 'admin';
