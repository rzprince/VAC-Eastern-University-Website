-- VAC Security Phase 1: signed registration PDF paths and database-backed abuse limits.
-- Apply while production remains on the legacy route. Keep allow_legacy=true
-- until the signed-path route has passed Vercel production verification.
-- Key is NOT stored in GitHub; set it privately in Supabase and Vercel.
create schema if not exists security_private;
revoke all on schema security_private from public, anon, authenticated;

create table if not exists security_private.vac_registration_config (
  id boolean primary key default true check (id = true),
  secret_hex text,
  allow_legacy boolean not null default true,
  check (secret_hex is null or secret_hex ~ '^[0-9a-f]{64}$')
);
revoke all on security_private.vac_registration_config from public, anon, authenticated;
insert into security_private.vac_registration_config (id, allow_legacy)
values (true, true) on conflict (id) do nothing;

create table if not exists security_private.vac_registration_rate_limits (
  kind text not null,
  fingerprint text not null,
  count integer not null default 1,
  expires_at timestamptz not null,
  primary key (kind, fingerprint)
);
revoke all on security_private.vac_registration_rate_limits from public, anon, authenticated;

create or replace function public.vac_registration_path_allowed(p_id uuid, p_path text)
returns boolean language plpgsql stable security definer
set search_path = pg_catalog
as $function$
declare
  v_secret text;
  v_legacy boolean;
  v_signature text;
begin
  select secret_hex,allow_legacy into v_secret,v_legacy
  from security_private.vac_registration_config where id = true;
  if coalesce(v_legacy,false) and p_path = ('membership/' || p_id::text || '.pdf') then
    return true;
  end if;
  if v_secret is null or p_id is null or p_path is null then return false; end if;
  v_signature := encode(extensions.hmac(convert_to(p_id::text,'UTF8'),decode(v_secret,'hex'),'sha256'),'hex');
  return p_path = ('membership/' || p_id::text || '-' || v_signature || '.pdf');
end;
$function$;
revoke all on function public.vac_registration_path_allowed(uuid,text) from public;
grant execute on function public.vac_registration_path_allowed(uuid,text) to anon,authenticated;

create or replace function public.vac_pdf_upload_path_allowed(p_path text)
returns boolean language plpgsql stable security definer
set search_path = pg_catalog
as $function$
declare v_matches text[];
begin
  v_matches := regexp_match(p_path,
    '^membership/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-([0-9a-f]{64}))?\.pdf$');
  if v_matches is null then return false; end if;
  return public.vac_registration_path_allowed(v_matches[1]::uuid,p_path);
exception when others then return false;
end;
$function$;
revoke all on function public.vac_pdf_upload_path_allowed(text) from public;
grant execute on function public.vac_pdf_upload_path_allowed(text) to anon,authenticated;

create or replace function public.vac_consume_registration_limit(
  p_fingerprint text, p_kind text, p_proof text
) returns boolean
language plpgsql volatile security definer
set search_path = pg_catalog
as $function$
declare
  v_secret text;
  v_expected text;
  v_limit integer;
  v_window interval;
  v_count integer;
  v_now timestamptz := now();
begin
  if p_kind not in ('network','student','email') or
    p_fingerprint !~ '^[0-9a-f]{64}$' or
    p_proof !~ '^[0-9a-f]{64}$' then return false; end if;
  select secret_hex into v_secret
  from security_private.vac_registration_config where id=true;
  if v_secret is null then return false; end if;
  v_expected := encode(extensions.hmac(
     convert_to('rate:' || p_kind || ':' || p_fingerprint,'UTF8'),
     decode(v_secret,'hex'),'sha256'),'hex');
  if v_expected <> p_proof then return false; end if;
  v_limit := case when p_kind = 'network' then 15 else 3 end;
  v_window := case when p_kind = 'network' then interval '1 hour' else interval '24 hours' end;

  insert into security_private.vac_registration_rate_limits
    (kind,fingerprint,count,expires_at)
  values (p_kind,p_fingerprint,1,v_now + v_window)
  on conflict (kind,fingerprint) do update
  set count = case when security_private.vac_registration_rate_limits.expires_at <= v_now
       then 1 else security_private.vac_registration_rate_limits.count + 1 end,
      expires_at = case when security_private.vac_registration_rate_limits.expires_at <= v_now
       then v_now + v_window else security_private.vac_registration_rate_limits.expires_at end
  returning count into v_count;
  return v_count <= v_limit;
end;
$function$;
revoke all on function public.vac_consume_registration_limit(text,text,text) from public;
grant execute on function public.vac_consume_registration_limit(text,text,text) to anon,authenticated;

drop policy if exists "Public application submit" on public.member_applications;
create policy "Public application submit" on public.member_applications
for insert to anon, authenticated
with check (
  status = 'awaiting_whatsapp'
  and registration_fee = (select registration_fee from public.site_settings where id=true)
  and bkash_transaction_id is null
  and reviewed_at is null
  and admin_notes is null
  and public.vac_registration_path_allowed(id,pdf_storage_path)
  and pdf_download_token ~ '^[0-9a-f]{64}$'
  and pdf_generated_at is not null
);

drop policy if exists "Public VAC application PDF insert" on storage.objects;
create policy "Public VAC application PDF insert" on storage.objects
for insert to anon,authenticated
with check (
  bucket_id = 'vac-applications' and
  public.vac_pdf_upload_path_allowed(name)
);

update storage.buckets
set allowed_mime_types = ARRAY['application/pdf'], file_size_limit = 2097152
where id = 'vac-applications';

-- Optional maintenance, run periodically from SQL editor:
-- delete from security_private.vac_registration_rate_limits
-- where expires_at < now() - interval '7 days';
