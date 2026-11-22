-- check-portal: run after every build and before publishing.
-- One read-only query. Run it with the builder's database tool (Lovable:
-- query_database) and show the user every row. Any FAIL must be fixed
-- before the portal is published. WARN rows are for the user to decide.
--
-- It checks the rules candidates' privacy depends on: CVs are private,
-- applications can't be read from the website, and only open jobs show.

with
pol as (
  select schemaname, tablename, cmd, roles::text[] as roles,
         coalesce(qual, '') || ' ' || coalesce(with_check, '') as body
  from pg_policies
),
pub as (  -- policies that apply to website visitors
  select * from pol where roles && array['anon', 'public']
),
tbl as (
  select c.relname, c.relrowsecurity
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in ('settings', 'jobs', 'applications')
),
bucket as (
  select * from storage.buckets where id = 'cvs'
),
checks(ord, check_name, result, detail) as (
  select 1, 'Tables exist',
    case when (select count(*) from tbl) = 3 then 'PASS' else 'FAIL' end,
    'Found: ' || coalesce((select string_agg(relname, ', ' order by relname) from tbl), 'none')
  union all
  select 2, 'Row level security is on',
    case when (select count(*) from tbl where relrowsecurity) = 3 then 'PASS' else 'FAIL' end,
    coalesce((select 'Off for: ' || string_agg(relname, ', ') from tbl where not relrowsecurity), 'On for settings, jobs and applications')
  union all
  select 3, 'Website visitors cannot read, change or delete applications',
    case when exists (select 1 from pub where tablename = 'applications' and cmd in ('SELECT', 'UPDATE', 'DELETE', 'ALL'))
         then 'FAIL' else 'PASS' end,
    coalesce((select 'Remove: ' || string_agg(cmd || ' policy', ', ') from pub
              where tablename = 'applications' and cmd in ('SELECT', 'UPDATE', 'DELETE', 'ALL')),
             'Visitors can only add an application')
  union all
  select 4, 'Applications need consent and an open job',
    case when exists (select 1 from pub where tablename = 'applications' and cmd = 'INSERT'
                      and body ilike '%consent%' and body ilike '%open%') then 'PASS' else 'FAIL' end,
    case when exists (select 1 from pub where tablename = 'applications' and cmd = 'INSERT' and body ilike '%consent%' and body ilike '%open%') then 'Consent and an open job are required' else 'The insert rule must require consent and an open job' end
  union all
  select 5, 'Only open, unexpired jobs are public',
    case when exists (select 1 from pub where tablename = 'jobs' and cmd in ('SELECT', 'ALL')
                      and body ilike '%open%' and body ilike '%closes_on%')
          and not exists (select 1 from pub where tablename = 'jobs' and cmd in ('SELECT', 'ALL')
                          and (body ilike '%true%' and body not ilike '%open%'))
         then 'PASS' else 'FAIL' end,
    'Drafts, closed jobs and jobs past their closing date must stay hidden from the website'
  union all
  select 6, 'Visitors cannot change jobs or settings',
    case when exists (select 1 from pub where tablename in ('jobs', 'settings') and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL'))
         then 'FAIL' else 'PASS' end,
    coalesce((select 'Remove: ' || string_agg(tablename || ' ' || cmd, ', ') from pub
              where tablename in ('jobs', 'settings') and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')),
             'Only HR (through the builder) can post or edit jobs')
  union all
  select 7, 'Job inbox addresses are hidden from visitors',
    case when has_column_privilege('anon', 'public.jobs', 'apply_email', 'SELECT') then 'WARN' else 'PASS' end,
    case when has_column_privilege('anon', 'public.jobs', 'apply_email', 'SELECT') then 'jobs.apply_email can be read from the website: limit visitors to the public columns' else 'Not readable from the website' end
  union all
  select 8, 'CV bucket exists and is private',
    case when not exists (select 1 from bucket) then 'FAIL'
         when (select public from bucket) then 'FAIL' else 'PASS' end,
    case when not exists (select 1 from bucket) then 'No bucket called cvs'
         when (select public from bucket) then 'The cvs bucket is PUBLIC: anyone with a link can open CVs'
         else 'cvs is private' end
  union all
  select 9, 'CV size and file types are limited',
    case when (select file_size_limit from bucket) between 1 and 10485760
          and (select allowed_mime_types from bucket) is not null then 'PASS' else 'WARN' end,
    'Limit: ' || coalesce((select (file_size_limit / 1048576)::text || ' MB' from bucket), 'none') ||
    ', types: ' || coalesce((select array_to_string(allowed_mime_types, ', ') from bucket), 'any')
  union all
  select 10, 'Visitors cannot open, list or delete CVs',
    case when exists (select 1 from pub where schemaname = 'storage' and tablename = 'objects'
                      and cmd in ('SELECT', 'UPDATE', 'DELETE', 'ALL')
                      and (body ilike '%cvs%' or body not ilike '%bucket_id%'))
         then 'FAIL' else 'PASS' end,
    coalesce((select 'Remove: ' || string_agg(cmd || ' policy on storage files', ', ') from pub
              where schemaname = 'storage' and tablename = 'objects' and cmd in ('SELECT', 'UPDATE', 'DELETE', 'ALL')
                and (body ilike '%cvs%' or body not ilike '%bucket_id%')),
             'Visitors can only upload')
  union all
  select 11, 'Company settings are filled in',
    case when (select count(*) from public.settings where coalesce(careers_email, '') <> ''
               and coalesce(privacy_contact, '') <> '') = 1 then 'PASS' else 'FAIL' end,
    coalesce((select 'Company: ' || company_name || ', inbox: ' || careers_email || ', keep CVs ' || retention_days || ' days'
              from public.settings limit 1), 'No settings row yet')
  union all
  select 12, 'Open jobs',
    case when (select count(*) from public.jobs where status = 'open' and (closes_on is null or closes_on >= current_date)) > 0
         then 'PASS' else 'WARN' end,
    (select count(*) from public.jobs where status = 'open' and (closes_on is null or closes_on >= current_date))::text
      || ' open, ' || (select count(*) from public.jobs where status = 'draft')::text || ' draft'
  union all
  select 13, 'Jobs past their closing date still marked open',
    case when exists (select 1 from public.jobs where status = 'open' and closes_on < current_date) then 'WARN' else 'PASS' end,
    coalesce((select string_agg(title, ', ') from public.jobs where status = 'open' and closes_on < current_date),
             'None. (They are hidden from the website anyway; offer to close them.)')
  union all
  select 14, 'Applications older than the retention period',
    case when exists (select 1 from public.applications a, public.settings s
                      where a.created_at < now() - make_interval(days => s.retention_days)) then 'WARN' else 'PASS' end,
    (select count(*) from public.applications a, public.settings s
     where a.created_at < now() - make_interval(days => s.retention_days))::text || ' due for deletion'
)
select check_name, result, detail from checks order by ord;
