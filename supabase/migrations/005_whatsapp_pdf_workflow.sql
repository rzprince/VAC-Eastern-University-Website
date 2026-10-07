-- VAC cinematic v2 membership workflow:
-- submit after bKash Send Money -> open WhatsApp -> admin receives TRX ID manually.
-- Each application may have a generated PDF snapshot.

alter table public.member_applications
  alter column bkash_transaction_id drop not null;

alter table public.member_applications
  add column if not exists application_ref text unique,
  add column if not exists pdf_storage_path text,
  add column if not exists pdf_generated_at timestamptz,
  add column if not exists google_drive_file_id text,
  add column if not exists drive_sync_status text not null default 'pending'
    check (drive_sync_status in ('pending','synced','not_configured','failed'));

alter table public.member_applications
  drop constraint if exists member_applications_status_check;

alter table public.member_applications
  alter column status set default 'awaiting_whatsapp';

alter table public.member_applications
  add constraint member_applications_status_check
  check (status in ('awaiting_whatsapp','payment_submitted','verified','approved','rejected'));

drop policy if exists "Public application submit" on public.member_applications;
create policy "Public application submit"
on public.member_applications
for insert
to anon, authenticated
with check (
  status in ('awaiting_whatsapp','payment_submitted')
  and registration_fee = (
    select registration_fee from public.site_settings where id = true
  )
);

insert into storage.buckets (id, name, public)
values ('vac-applications', 'vac-applications', false)
on conflict (id) do update set public = false;

drop policy if exists "Public VAC application PDF insert" on storage.objects;
create policy "Public VAC application PDF insert"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'vac-applications'
  and (storage.foldername(name))[1] = 'membership'
  and lower(storage.extension(name)) = 'pdf'
);

drop policy if exists "Admin VAC application PDF read" on storage.objects;
create policy "Admin VAC application PDF read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vac-applications'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admin VAC application PDF delete" on storage.objects;
create policy "Admin VAC application PDF delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vac-applications'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create index if not exists idx_member_applications_ref
on public.member_applications (application_ref);
