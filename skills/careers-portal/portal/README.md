# Careers portal (reference build)

A finished careers site for a small company: open roles with search and team filters, a page for each role, an apply form with CV upload and consent, a confirmation page, and a privacy note. It's the design and behaviour the `careers-portal` skill asks the app builder to reproduce.

Open `index.html` through any local web server (for example `python3 -m http.server` in this folder) to try it. It starts in **demo mode** with the invented company Acme Inc. Nothing is sent or saved.

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell |
| `styles.css` | All styling: Manrope for headings, Karla for text, teal `#005F53` with mint, sand and amber. Brand colour comes from settings; text colour on buttons is picked for contrast automatically |
| `app.js` | Pages, search and filters, apply form, and the connection to the backend. No build step |
| `config.js` | Backend URL and public key. Empty = demo mode |
| `demo-data.js` | Sample settings and jobs for demo mode |
| `supabase/schema.sql` | Tables, access rules and private CV storage for Lovable Cloud or Supabase |

## Pages

The address after `#` picks the page, so it works on any static host:

| Address | Page |
|---|---|
| `#` (or `#roles`) | Open roles |
| `#role-warehouse-supervisor` | One role |
| `#apply-warehouse-supervisor` | Apply for that role |
| `#applied-warehouse-supervisor` | Confirmation |
| `#privacy` | How applications are handled |

## Ways to use it

1. **With Lovable (the skill's default).** The assistant sends these files to Lovable with the build brief and asks it to reproduce the design and behaviour in the Lovable project, using `supabase/schema.sql` for the database.
2. **As is, on any static host.** Run `supabase/schema.sql` in a Supabase project, put the project URL and its public (anon) key in `config.js`, add the first row to `settings`, and publish this folder on GitHub Pages, Netlify or similar. Email notifications then need a server function; see `../reference/email-options.md`.

Never put a service-role or secret key in `config.js`. It's public.

## What the access rules guarantee

Tested against PostgreSQL 16 with Supabase-style roles:

- The public can read settings and **open** jobs only; drafts, closed and expired jobs stay hidden, and so do internal columns.
- The public can add an application only to an open job, only with consent, only with status `new`, and only with a CV path that matches `{job_id}/{application_id}/cv.{ext}`.
- The public can upload a CV named `cv.pdf`, `cv.doc` or `cv.docx` into an open job's folder, and can't read, list, replace or delete any file.
- The public can't read any application or run the retention clean-up.

## Accessibility

Keyboard reachable throughout, visible focus, labelled fields with clear error messages, a skip link, live announcements when filters change, reduced motion respected, and the button text colour checked for contrast against the brand colour.

All companies, people and figures in the demo are fictional.
