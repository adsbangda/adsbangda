-- ============================================================================
-- AdsBangda Growth Dashboard — Final Admin Client Workflow Refactor
-- ============================================================================
-- Jalankan SETELAH 0001-0009.
--
-- Additive saja:
--   performance_metrics: +closing, +conversion_rate — dipakai Meta Ads.
--   CPC & CPL TIDAK butuh kolom baru (sudah ada dari migration 0008: cpc,
--   cost_per_lead) — cuma logic penulisannya yang berubah jadi auto-compute
--   di layer aplikasi (admin-data.ts), bukan di database.
--
-- `projects` TIDAK disentuh sama sekali — tetap ada, tidak di-drop, hanya
-- dihapus dari tab navigasi utama (perubahan UI, bukan database).
-- ============================================================================

alter table performance_metrics add column if not exists closing int;
alter table performance_metrics add column if not exists conversion_rate numeric;

-- ----------------------------------------------------------------------------
-- APPROVAL RPC — client TIDAK dikasih UPDATE langsung ke content_items (biar
-- tidak bisa ubah field lain). RPC ini cuma boleh ubah approval_status (+
-- ikut update content status kalau approve), dan HARUS milik client yang
-- sedang login (dicek via client_users). Approval history selalu ditambah,
-- TIDAK overwrite.
-- ----------------------------------------------------------------------------

create or replace function client_respond_to_approval(target_content_id uuid, response text, response_note text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_approval_required boolean;
  v_status text;
begin
  if response not in ('approved', 'revision_requested') then
    raise exception 'invalid response';
  end if;

  select client_id, approval_required, status into v_client_id, v_approval_required, v_status
  from content_items where id = target_content_id;

  if v_client_id is null then
    raise exception 'content not found';
  end if;

  if not is_member_of_client(v_client_id) then
    raise exception 'not authorized';
  end if;

  if not v_approval_required then
    raise exception 'content ini tidak butuh approval';
  end if;

  if response = 'approved' then
    update content_items
      set approval_status = 'approved',
          status = case when status = 'waiting_approval' then 'approved' else status end
      where id = target_content_id;
    insert into content_approval_history (content_id, action, note, actor) values (target_content_id, 'approved', response_note, 'Client');
  else
    update content_items set approval_status = 'revision' where id = target_content_id;
    insert into content_approval_history (content_id, action, note, actor) values (target_content_id, 'revision_requested', response_note, 'Client');
  end if;
end;
$$;

grant execute on function client_respond_to_approval(uuid, text, text) to authenticated;
