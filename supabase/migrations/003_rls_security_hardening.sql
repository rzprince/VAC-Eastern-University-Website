-- Security/performance hardening for VAC RLS policies.

-- The auto-RLS event-trigger function should not be callable through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ADMIN USERS
drop policy if exists "Own admin record" on public.admin_users;
create policy "Own admin record"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

-- COMMITTEE
drop policy if exists "Public committee" on public.committee_members;
drop policy if exists "Admin committee" on public.committee_members;

create policy "Public committee"
on public.committee_members
for select
to anon
using (active = true);

create policy "Authenticated committee read"
on public.committee_members
for select
to authenticated
using (
  active = true
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin committee insert"
on public.committee_members
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin committee update"
on public.committee_members
for update
to authenticated
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

create policy "Admin committee delete"
on public.committee_members
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

-- EVENTS
drop policy if exists "Public events" on public.events;
drop policy if exists "Admin events" on public.events;

create policy "Public events"
on public.events
for select
to anon
using (published = true);

create policy "Authenticated events read"
on public.events
for select
to authenticated
using (
  published = true
  or exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin events insert"
on public.events
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin events update"
on public.events
for update
to authenticated
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

create policy "Admin events delete"
on public.events
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

-- MEDIA
drop policy if exists "Public media" on public.media_items;
drop policy if exists "Admin media" on public.media_items;

create policy "Public media"
on public.media_items
for select
to anon
using (published = true);

create policy "Authenticated media read"
on public.media_items
for select
to authenticated
using (
  published = true
  or exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin media insert"
on public.media_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin media update"
on public.media_items
for update
to authenticated
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

create policy "Admin media delete"
on public.media_items
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

-- MEMBER APPLICATIONS
drop policy if exists "Public application submit" on public.member_applications;
drop policy if exists "Admin applications read" on public.member_applications;
drop policy if exists "Admin applications update" on public.member_applications;

create policy "Public application submit"
on public.member_applications
for insert
to anon, authenticated
with check (
  status = 'payment_submitted'
  and registration_fee = (
    select registration_fee
    from public.site_settings
    where id = true
  )
);

create policy "Admin applications read"
on public.member_applications
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin applications update"
on public.member_applications
for update
to authenticated
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

-- SITE SETTINGS
drop policy if exists "Public can view VAC site settings" on public.site_settings;
drop policy if exists "Admins can update VAC site settings" on public.site_settings;

create policy "Public site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admin site settings update"
on public.site_settings
for update
to authenticated
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

-- STORAGE
drop policy if exists "Public VAC media" on storage.objects;
drop policy if exists "Admin VAC media insert" on storage.objects;
drop policy if exists "Admin VAC media update" on storage.objects;
drop policy if exists "Admin VAC media delete" on storage.objects;

create policy "Public VAC media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'vac-media');

create policy "Admin VAC media insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vac-media'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin VAC media update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vac-media'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'vac-media'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);

create policy "Admin VAC media delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vac-media'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  )
);
