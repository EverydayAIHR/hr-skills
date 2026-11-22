# How applications reach the inbox

A web page can't send email by itself. When a candidate applies, the portal saves the CV and the application, then a small server function sends the notification. These are the ways to do that, cheapest first.

| Option | Cost | Needs own domain? | CV in the email? | Best for |
|---|---|---|---|---|
| A. Company Gmail | Free builder plan works for building; check the connector's plan | No | Yes, attached | Companies on Gmail or Google Workspace |
| B. Review in chat | Free | No | No, viewed through a link | Microsoft 365 users, or a backup |
| C. Lovable Emails | Paid Lovable plan | Yes | Not confirmed; use a signed link | Companies that want `jobs@company.com` with no extra provider |
| D. Resend | Paid Lovable plan for the domain; Resend free tier for low volumes | Yes | Yes, attached | Companies that want `jobs@company.com` with attachments |

## A. The company's Gmail (recommended free option)

How it works: the portal uses Lovable's Google Workspace (Gmail) connector, which sends as **one connected Google account**. Every application arrives from that account, with the CV attached and Reply-To set to the candidate.

Steps for the user:
1. Create or choose a **shared careers inbox** (for example careers.acme@gmail.com, or careers@ on Google Workspace). Don't use a personal mailbox; it causes trouble when staff change.
2. In the Lovable project, connect Google (Gmail) and sign in with that inbox. Only the user can do this sign-in.
3. Ask the builder (the assistant sends this to Lovable):

```
Use the Gmail connector. When a new application is saved, send an email
from the connected Gmail account to the job's apply_email (or the
settings careers_email), with reply-to set to the candidate's email.
Subject: "New application: {job title}, {candidate name}".
Body: candidate name, email, phone, cover note, consent recorded, and a
line saying "Reply to this email to contact the candidate".
Attach the CV from the cvs bucket. Set applications.notified_at.
If sending fails, keep the application and log the error.
```

4. Send one test application and confirm it arrived with the attachment.

Notes:
- The connected account is shared by the whole app. Anyone who can edit the Lovable project can use it.
- Gmail has daily sending limits, far above what a small company's careers page needs.

## B. Review in chat (no email)

How it works: nothing is emailed. Applications and CVs stay in the portal, and the HR person asks their assistant, for example "Who applied for the driver role this week?". The assistant reads the `applications` table through the Lovable connector and gives signed links to the CVs. See `reference/everyday-tasks.md`.

Use it when the company is on Microsoft 365, when no one wants another mailbox, or as a backup if email stops working. Set `settings.notify_mode = 'chat_only'`.

Suggest a weekly reminder ("Check new applicants every Monday") if the user's assistant can schedule tasks.

## C and D. Own domain (paid plan)

Both need the company's own email domain (for example `company.com`). A custom website address like `careers.company.com` also needs a **paid Lovable plan**; publishing on `yourcompany.lovable.app` works on every plan.

### Own domain for the website (optional, paid)

1. Upgrade the Lovable workspace to a paid plan.
2. In the project, open Domains and connect `careers.company.com` (or buy a domain through Lovable).
3. Add the DNS records Lovable shows at the company's domain provider, or let Lovable set them automatically if it offers that for the provider. This is usually IT's job; offer to draft a short request to IT.
4. Wait for verification (often minutes, up to 72 hours). Lovable sets up HTTPS automatically.

### C. Lovable Emails (built in, paid plan)

Lovable's Emails feature sends app emails from the company's own domain, with no separate provider or API key. Lovable guides the domain setup (SPF, DKIM and DMARC records).

1. In the project, open More → Emails and add the sending domain (Lovable suggests a subdomain such as `notify.company.com`).
2. Add the DNS records it shows, or let Lovable add them if the domain is managed by Lovable.
3. Wait until the sender shows as verified. App emails only send after that.
4. Ask the builder: "Send the employer notification and the candidate acknowledgement as app emails."

Attachments: not confirmed for Lovable Emails at the time of writing. Put a **signed link** to the CV in the email (expires after 7 days), and tell the user.

### D. Resend (paid plan, attachments)

Resend is an email service that Lovable connects to. Without a verified domain, Resend only delivers to the Resend account owner's own address, so it isn't suitable for production until the domain is verified.

1. Create a Resend account, add the company domain and add its DNS records.
2. In Lovable, add the Resend connector (Lovable stores the key as a secret; never paste it into chat or code).
3. Ask the builder to send from `jobs@<verified domain>` with the CV attached, Reply-To set to the candidate, and an acknowledgement to the candidate.

### Extra with C or D: candidate acknowledgement

With an own domain, the portal can also send each candidate a short "We've received your application" email. Draft the wording with the user; don't promise a reply time they haven't agreed to.
