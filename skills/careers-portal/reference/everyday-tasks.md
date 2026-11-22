# Everyday tasks after launch

On Lovable, use the connector's database tool (`query_database`) for job changes. It changes one row and the page updates straight away, with no Lovable agent run. Use the Lovable agent (`send_message`) only for changes to the page's design or features.

Database writes go **straight to the live site**. Before every insert or update: show the job or the change in plain words, wait for a clear yes, then run it. Afterwards, confirm what changed and give the job's link.

First, find the project: list the user's Lovable projects and confirm which one is the careers portal. Read `settings` once so you know the company name and the default inbox.

## Post a job

1. Ask for: title, location, work mode, type, a few lines on the role, requirements, closing date, and pay only if the company shows pay. Use what the user already said; ask once for the gaps.
2. Write a clear, inclusive ad: plain language, no age, gender or nationality requirements unless the law requires them, and requirements split into must-have and nice-to-have. Don't add benefits or claims the user didn't give.
3. Show the preview exactly as it will appear, plus the inbox it goes to. Ask: "Shall I publish it?"
4. On yes, insert the row with `status = 'open'`. Example:

```sql
INSERT INTO jobs (slug, title, location, work_mode, employment_type,
                  summary, description, requirements, closes_on, status)
VALUES ('warehouse-supervisor', 'Warehouse Supervisor', 'Tuas, Singapore',
        'onsite', 'full_time', 'Lead a day-shift team of 8.',
        '...', '...', '2026-12-31', 'open');
```

5. Confirm it's live and share the link. Offer to draft a short LinkedIn post about the role for the user to post themselves.

To prepare without publishing, insert it with `status = 'draft'` and say so.

## Edit a job

Find the job by title, show the current and new values side by side, ask for yes, then update only the fields that change and `updated_at`.

## Close a job

"We've filled the accountant role" → find the job, confirm it's the right one, ask for yes, then `UPDATE jobs SET status = 'closed'`. Never delete jobs; closed jobs are the hiring history. Offer to draft a polite note for the other applicants. Drafts only: the user sends them.

## Review applicants

Read-only, so no yes is needed:

- "Who applied for the driver role?" → list name, date, status and a signed CV link for each.
- "Anything new this week?" → applications since last Monday, grouped by job.
- "Shortlist for the accountant role" → read the CVs the user asks about, compare them against the job's requirements, and show your reasoning per candidate. The user decides. Never reject or contact anyone on your own.

Changing an applicant's `status` (for example to `shortlisted`) is a write: confirm first.

## Housekeeping checks (monthly, if the user wants)

- Jobs past their closing date that are still `open`.
- The retention clean-up ran (no applications older than `retention_days`).
- Test that one application still reaches the inbox.

## If the database tool isn't available

Give the user the change in plain words and ask them to make it in Lovable's chat, for example: "Add a new open job: Warehouse Supervisor, Tuas, full time, closes 31 Dec…". It works the same, but uses Lovable credits.
