-- Careers portal: database, storage and access rules.
-- For Lovable Cloud or any Supabase project. Run once, as a migration.
-- One company per project. See ../../reference/data-model.md.

-- ---------- tables ----------

create table if not exists public.settings (
  id              smallint primary key default 1 check (id = 1),  -- one row only
  company_name    text not null,
  tagline         text,
  about           text,
  careers_email   text not null,
  privacy_contact text not null,
  retention_days  integer not null default 180 check (retention_days between 30 and 1095),
  show_pay        boolean not null default false,
  brand_primary   text check (brand_primary ~* '^#[0-9a-f]{6}$'),
  logo_url        text,
  website_url     text,
  highlights      jsonb not null default '[]'::jsonb,   -- [{ "title": "...", "text": "..." }]
  notify_mode     text not null default 'chat_only'
                  check (notify_mode in ('gmail', 'chat_only', 'lovable_emails', 'resend')),
  updated_at      timestamptz not null default now()
);

create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null,
  department      text,
  location        text not null,
  work_mode       text not null default 'onsite' check (work_mode in ('onsite', 'hybrid', 'remote')),
  employment_type text not null default 'full_time'
                  check (employment_type in ('full_time', 'part_time', 'contract', 'internship')),
  summary         text,
  description     text,          -- simple Markdown: "## Heading", "- bullet", paragraphs
  requirements    text,
  pay_text        text,          -- shown only when settings.show_pay is true
  apply_email     text,          -- overrides settings.careers_email for this job
  closes_on       date,
  status          text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  job_id           uuid not null references public.jobs(id) on delete restrict,
  full_name        text not null check (length(full_name) between 1 and 200),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text check (length(phone) <= 40),
  cover_note       text check (length(cover_note) <= 2000),
  cv_path          text not null,
  cv_original_name text,
  consent          boolean not null check (consent),
  consent_text     text not null,
  status           text not null default 'new'
                   check (status in ('new', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  notified_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists jobs_status_idx on public.jobs (status, closes_on);
create index if not exists applications_job_idx on public.applications (job_id, created_at desc);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------- access rules ----------
-- The public (candidates) use the anon key. HR works through the builder's
-- dashboard or connector, which uses privileged access and bypasses these rules.

alter table public.settings     enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;

-- Settings: readable by everyone (nothing secret is stored here).
drop policy if exists "public reads settings" on public.settings;
create policy "public reads settings" on public.settings
  for select to anon, authenticated using (true);

-- Jobs: the public sees open jobs that haven't closed.
drop policy if exists "public reads open jobs" on public.jobs;
create policy "public reads open jobs" on public.jobs
  for select to anon, authenticated
  using (status = 'open' and (closes_on is null or closes_on >= current_date));

-- Applications: the public can only add one, to an open job, with consent.
-- No select, update or delete policies, so candidates can't read any application.
drop policy if exists "public submits applications" on public.applications;
create policy "public submits applications" on public.applications
  for insert to anon, authenticated
  with check (
    consent
    and status = 'new'
    and notified_at is null
    and exists (select 1 from public.jobs j
                where j.id = job_id and j.status = 'open'
                  and (j.closes_on is null or j.closes_on >= current_date))
    and cv_path like job_id::text || '/' || id::text || '/cv.%'
  );

-- Hide internal columns from the public even though rows are readable.
revoke select on public.jobs from anon;
grant select (id, slug, title, department, location, work_mode, employment_type,
              summary, description, requirements, pay_text, closes_on, status, created_at)
  on public.jobs to anon;
revoke select on public.settings from anon;
grant select (company_name, tagline, about, careers_email, privacy_contact, retention_days,
              show_pay, brand_primary, logo_url, website_url, highlights)
  on public.settings to anon;

-- ---------- CV storage ----------
-- Private bucket. Layout: cvs/{job_id}/{application_id}/cv.{pdf|doc|docx}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- The public can upload a new CV into an open job's folder. No read, list,
-- overwrite or delete.
drop policy if exists "public uploads cvs" on storage.objects;
create policy "public uploads cvs" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'cvs'
    and array_length(storage.foldername(name), 1) = 2
    and storage.filename(name) ~ '^cv\.(pdf|doc|docx)$'
    and exists (select 1 from public.jobs j
                where j.id::text = (storage.foldername(name))[1]
                  and j.status = 'open'
                  and (j.closes_on is null or j.closes_on >= current_date))
  );

-- ---------- retention ----------
-- Lists applications past the retention period. A scheduled server function
-- (a Lovable scheduled job or a Supabase Edge Function on a cron) should, once
-- a day: delete each listed application's folder through the Storage API,
-- then delete the rows with public.delete_expired_applications().
-- Deleting rows in storage.objects directly does not remove the files.

create or replace function public.expired_applications()
returns table (id uuid, cv_path text)
language sql stable security definer set search_path = public as $$
  select a.id, a.cv_path from public.applications a, public.settings s
  where a.created_at < now() - make_interval(days => s.retention_days)
$$;

create or replace function public.delete_expired_applications()
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.applications a using public.settings s
  where a.created_at < now() - make_interval(days => s.retention_days);
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.expired_applications() from public, anon, authenticated;
revoke all on function public.delete_expired_applications() from public, anon, authenticated;
