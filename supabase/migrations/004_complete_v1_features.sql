-- VAC complete v1: announcements, member registry, event links, and site controls.

alter table public.site_settings
  add column if not exists registration_open boolean not null default true,
  add column if not exists contact_email text not null default 'rzprince02@gmail.com',
  add column if not exists contact_phone text not null default '+880 1860899999';

alter table public.events
  add column if not exists facebook_url text;

alter table public.member_applications
  add column if not exists admin_notes text,
  add column if not exists reviewed_at timestamptz;

alter table public.member_applications
  drop constraint if exists member_applications_blood_group_check;

alter table public.member_applications
  add constraint member_applications_blood_group_check
  check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-'));

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  link_url text,
  pinned boolean not null default false,
  published boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Public announcements" on public.announcements;
create policy "Public announcements"
on public.announcements for select to anon
using (published = true and (expires_at is null or expires_at > now()));

drop policy if exists "Authenticated announcements read" on public.announcements;
create policy "Authenticated announcements read"
on public.announcements for select to authenticated
using (
  (published = true and (expires_at is null or expires_at > now()))
  or exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admin announcements insert" on public.announcements;
create policy "Admin announcements insert"
on public.announcements for insert to authenticated
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admin announcements update" on public.announcements;
create policy "Admin announcements update"
on public.announcements for update to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admin announcements delete" on public.announcements;
create policy "Admin announcements delete"
on public.announcements for delete to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.member_applications(id) on delete cascade,
  member_number text unique,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.club_members enable row level security;

drop policy if exists "Admins read members" on public.club_members;
create policy "Admins read members"
on public.club_members for select to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins update members" on public.club_members;
create policy "Admins update members"
on public.club_members for update to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create or replace function public.sync_approved_vac_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' then
    insert into public.club_members (application_id, active, joined_at, updated_at)
    values (new.id, true, coalesce(new.reviewed_at, now()), now())
    on conflict (application_id)
    do update set active = true, updated_at = now();
  elsif old.status = 'approved' and new.status <> 'approved' then
    update public.club_members
    set active = false, updated_at = now()
    where application_id = new.id;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_approved_vac_member() from public, anon, authenticated;

drop trigger if exists trg_sync_approved_vac_member on public.member_applications;
create trigger trg_sync_approved_vac_member
after insert or update of status on public.member_applications
for each row
execute function public.sync_approved_vac_member();

insert into public.club_members (application_id, active, joined_at, updated_at)
select id, true, coalesce(reviewed_at, created_at), now()
from public.member_applications
where status = 'approved'
on conflict (application_id) do nothing;

create index if not exists idx_events_published_starts_at
on public.events (published, starts_at);

create index if not exists idx_media_published_published_at
on public.media_items (published, published_at desc);

create index if not exists idx_announcements_public
on public.announcements (published, pinned desc, created_at desc);

create index if not exists idx_applications_status_created
on public.member_applications (status, created_at desc);
