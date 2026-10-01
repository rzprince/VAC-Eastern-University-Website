create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  club_name text not null default 'Visual Archive Club',
  short_name text not null default 'VAC',
  university text not null default 'Eastern University',
  since text not null default '2010',
  tenure text not null default 'June 2026 — June 2027',
  tagline text not null default 'Where Every Frame Tells a Story',
  about_text text not null default 'Visual Archive Club is a creative community for photography, videography, editing, design and visual storytelling. VAC documents university life and helps students build practical creative skills.',
  facebook_page text not null default 'https://www.facebook.com/visualarchiveeu',
  facebook_group text not null default 'https://www.facebook.com/groups/603306963175089',
  bkash_number text not null default '01860899999',
  registration_fee integer not null default 100 check (registration_fee > 0),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public can view VAC site settings"
on public.site_settings for select
using (true);

create policy "Admins can update VAC site settings"
on public.site_settings for update
using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;


alter table public.member_applications
  drop constraint if exists member_applications_registration_fee_check;

alter table public.member_applications
  add constraint member_applications_registration_fee_check
  check (registration_fee > 0);
