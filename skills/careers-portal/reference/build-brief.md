# Build brief

Fill in the `{placeholders}` from Step 2 and the email choice from Step 3, then send the brief to the app builder in one message. Remove the email section you're not using. Written for Lovable; for other builders see `other-builders.md`.

**Attach the reference build.** The finished design lives in `../portal/` (online: https://github.com/EverydayAIHR/hr-skills/tree/main/skills/careers-portal/portal). Attach `index.html`, `styles.css`, `app.js` and `supabase/schema.sql` to the message (with the Lovable connector: get an upload address for each file, then pass the files with the message). If you can't attach files, paste the GitHub link and ask the builder to follow it.

```
Build a careers portal for {company_name}. Use Lovable Cloud for the
database, file storage and server functions.

REFERENCE BUILD (attached)
- Reproduce the attached reference build's design and behaviour in this
  project: same layout, type (Manrope headings, Karla body text), spacing, pages,
  filters, apply form, validation messages and confirmation page.
- Use the attached schema.sql as the database migration, unchanged.
- Keep the same page addresses for roles (role, apply and applied pages
  by job slug).

BRAND
- Company: {company_name}. About: {about}.
- Colours: primary {brand_primary}, buttons {brand_dark}, light
  backgrounds {brand_tint}. Use the uploaded logo in the header.
- Clean, friendly, mobile-first. Body text at least 16px, good contrast,
  keyboard accessible, alt text on images.

PAGES
1. Careers home: a short intro, search, and filters for location, work
   mode and type, then cards for open jobs (title, location, work mode,
   type, summary, closing date). An empty state when there are no open
   roles: "No open roles right now. Check back soon."
2. Job page at /jobs/{slug}: the full description and requirements, pay
   only if shown, closing date, and an Apply form.
3. Apply form: full name, email, phone, optional cover note, CV upload
   (PDF/DOC/DOCX, max 5 MB) and a required consent checkbox with this
   text: "{consent_text}". A link to the privacy note. A hidden spam
   field. On success: "Thanks, we've received your application."
4. Privacy note page with: {privacy_note}.

DATA (create exactly these)
- settings (one row), jobs and applications tables with the fields in
  the data model below.
- A PRIVATE storage bucket "cvs". Save each CV as
  {job_id}/{application_id}/cv.{ext} and keep the original file name in
  applications.cv_original_name.
- Access: the public can read only jobs with status 'open' whose
  closes_on is empty or today or later. The public can insert
  applications and upload a CV for their new application, but cannot
  read, list, update or delete applications or files.
- Rate-limit applications (5 per hour per visitor). Validate file type
  and size on the server too.
- A daily scheduled job that deletes applications and CV files older
  than settings.retention_days ({retention_days}).

[Paste the tables from data-model.md here.]

SEED
- Insert the settings row with the values above.
- Insert one sample job with status 'draft' so the layout can be
  checked. Do not publish it.

EMAIL (keep one)
- Gmail: use the Gmail connector. On each new application, email the
  job's apply_email (or settings.careers_email) from the connected
  account, reply-to the candidate, subject "New application: {job
  title}, {candidate name}", CV attached. Set notified_at.
- Chat only: no email. Do nothing extra.
- Lovable Emails: send the employer notification and a candidate
  acknowledgement as app emails from the verified domain, with a 7-day
  signed link to the CV instead of an attachment.
- Resend: use the Resend connector, send from jobs@{verified_domain}
  with the CV attached, reply-to the candidate, plus a candidate
  acknowledgement.

Do not add sign-up or login for candidates. Do not show any
application data on public pages.
```

## Check after the build

- [ ] Open the careers page while signed out: only open jobs show, and the draft sample doesn't.
- [ ] Apply with a test CV: a success message appears and a row is saved.
- [ ] The `cvs` bucket is private (no public link opens the file).
- [ ] An email arrived, if one was chosen.
- [ ] The page works on a phone.
- [ ] Delete the test application and the sample job when the user is happy.
