# Data model

The exact SQL, with access rules and storage policies, is in `../portal/supabase/schema.sql`.

The portal keeps jobs as **data**, not as page text. The page reads open jobs from a table, so posting, editing and closing a job is a change to one row. There's no rebuild and no redeploy.

This model is for **one company per portal**. Each company builds its own copy.

## Tables

### `settings` (one row)

| Field | Type | Notes |
|---|---|---|
| company_name | text | |
| tagline | text | Optional, e.g. "Industrial supplies, Singapore" |
| hero_headline | text | Optional headline, e.g. "Step into a rewarding career". The portal has a default |
| about | text | One or two lines shown on the careers page |
| careers_email | text | Default inbox for applications |
| privacy_contact | text | Shown in the privacy note |
| retention_days | integer | How long CVs and applications are kept, e.g. 180 |
| show_pay | boolean | Default false |
| brand_primary | text | Hex colour confirmed by the user. Button text colour and lighter and darker shades are worked out from it |
| logo_url | text | Optional; initials are shown if empty |
| website_url | text | Optional |
| highlights | json | Optional list of up to three `{title, text}` points for "Working at…". Only what the user supplied |
| notify_mode | text | `gmail`, `chat_only`, `lovable_emails` or `resend` |

### `jobs`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| slug | text, unique | Used in the job's web address, e.g. `warehouse-supervisor` |
| title | text | Required |
| department | text | Optional |
| location | text | Required, e.g. "Tuas, Singapore" |
| work_mode | text | `onsite`, `hybrid` or `remote` |
| employment_type | text | `full_time`, `part_time`, `contract` or `internship` |
| summary | text | One or two lines for the job card |
| description | text | Full description; plain text or simple Markdown |
| requirements | text | Optional |
| pay_text | text | Optional; only shown when `settings.show_pay` is true and the user supplied it |
| apply_email | text | Optional override of `settings.careers_email` |
| closes_on | date | Optional. The page hides the job automatically after this date |
| status | text | `draft`, `open` or `closed`. Jobs are closed, never deleted |
| created_at, updated_at | timestamp | |

### `applications`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| job_id | uuid | References `jobs.id` |
| full_name, email, phone | text | Name and email required |
| cover_note | text | Optional, max 2,000 characters |
| cv_path | text | Path in the `cvs` storage bucket |
| cv_original_name | text | The candidate's file name, kept for display and email attachments |
| consent | boolean | Must be true to submit |
| consent_text | text | Copy of the consent wording the candidate agreed to |
| status | text | `new`, `reviewed`, `shortlisted`, `rejected` or `hired` |
| notified_at | timestamp | When the inbox email was sent (empty for `chat_only`) |
| created_at | timestamp | |

## File storage

- One **private** bucket called `cvs`. It must never be public.
- Folder layout, one folder per job and one sub-folder per application:

```
cvs/
  {job_id}/
    {application_id}/
      cv.pdf        (or cv.doc / cv.docx)
```

- The file is always saved as `cv.<ext>`. The candidate's original file name goes in `applications.cv_original_name`, so odd characters or personal details never end up in storage paths. Emails attach the file under its original name.
- Deleting a job's applications (or the retention clean-up) removes the whole `{application_id}` folder.
- Accept PDF, DOC and DOCX only, up to **5 MB**. That keeps emails with attachments well inside mailbox limits.
- Anyone viewing CVs gets a signed link that expires (for example after 7 days), never a permanent public link.
- On Lovable this is Lovable Cloud storage. Lovable creates the bucket and the upload flow from the build brief.

## Access rules

| Who | jobs | applications | cvs bucket |
|---|---|---|---|
| Public (candidates) | Read rows where `status = 'open'` and `closes_on` is empty or today or later | Insert only. No read, update or delete | Upload only, to a new application folder. No read or list |
| HR / the assistant | Full access through the builder's dashboard or connector | Read and update `status` | Read through signed links |

## Housekeeping

- A daily scheduled job deletes applications and their CV files older than `settings.retention_days`.
- Applications are rate-limited (for example 5 per hour per visitor) and the form has a hidden spam field.
- Deleting a file sends the deletion to the storage service. The builder may keep backups for a period; mention this in the privacy note if the user wants to be precise.
