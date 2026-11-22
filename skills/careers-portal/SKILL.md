---
name: careers-portal
description: Build and run a company careers portal with an AI app builder (Lovable by default; Replit, Base44 or Bolt as alternatives), then post, edit and close jobs and review applicants from the AI assistant. Use when an HR person asks for a careers page, job portal or job board for their company, or wants to post, update or close a job on a portal built this way.
---

# Careers portal

_These instructions are written for any AI assistant. The frontmatter above is for tools that load skills automatically. If you are pasting this into a chat, you can ignore it._

Help an HR person with no coding background get a careers portal for their own company. Candidates browse open roles and apply with a CV. The HR person then posts, edits and closes jobs by chatting with their assistant, with no web developer needed.

The portal belongs to the company. It is built in the company's own app-builder account, CVs are stored in that account, and applications reach the company's own inbox. Nobody else, including the author of this skill, can see the portal or its applicants.

Reference files in this skill (online: https://github.com/EverydayAIHR/hr-skills/tree/main/skills/careers-portal):

| File | Use it for |
|---|---|
| `reference/build-brief.md` | The build instructions to send to the app builder |
| `reference/data-model.md` | Tables, file storage and access rules the portal must have |
| `reference/email-options.md` | How applications reach the inbox: free options and own-domain options |
| `reference/everyday-tasks.md` | Posting, editing, closing jobs and reviewing applicants after launch |
| `reference/other-builders.md` | Replit, Base44 and Bolt instead of Lovable |
| `portal/` | The finished reference portal: design, pages, apply form and `supabase/schema.sql`. Demo mode runs with invented data |
| `formats/careers-portal-demo.html` | A walkthrough page explaining how CVs reach HR and how jobs are posted from the assistant |

## Ground rules (apply at every step)

1. **Ask before every change that goes live.** Show what will change (the job, the edit, the page) and wait for a clear yes before publishing, posting, editing or closing anything. A request like "post this job" is permission to prepare it, not to publish it.
2. **Never invent company facts.** Pay, benefits, policies, addresses and closing dates come from the user. If something is missing, ask or leave it out.
3. **Never make up candidates or decisions.** You can summarise and sort applicants. Hiring decisions stay with the HR person.
4. **CVs are personal data.** Keep them in private storage, never paste a CV's contents into a public page, and follow the retention period the user sets.
5. **Steps the user must do themselves:** creating accounts, signing in, connecting Gmail or other accounts, paying for a plan, and changing DNS records. Explain the step, then wait.
6. **Say what you can't do.** If the connector or tool needed for a step isn't available to you, say so and give the user the manual route.

## Step 1: Check what's needed

Ask which AI assistant and which app builder the user has. Default to **Lovable** unless they already use another builder (then see `reference/other-builders.md`).

For Lovable the user needs:

1. **A Lovable account** at https://lovable.dev. The free plan is enough to build, publish on a `yourcompany.lovable.app` address and test. A custom domain needs a paid plan.
2. **The Lovable connector in their assistant.** Lovable's MCP server works with Claude (claude.ai and the desktop app), ChatGPT, Claude Code, Cursor and VS Code. In Claude: **+** → Connectors → Browse connectors → Lovable → Connect, then sign in to Lovable. Setup steps for other assistants are at https://lovable.dev/mcp.

Check that the connector works by listing the user's Lovable workspaces. If it doesn't work, the user can still follow this skill by pasting each brief into Lovable's own chat. Tell them that's the fallback.

Using the Lovable agent (creating a project, sending it a message) spends the user's Lovable credits. Say so once before the build.

## Step 2: Collect the company details

Ask for these together, in one short list. Don't ask one question at a time.

| Detail | Example | Needed? |
|---|---|---|
| Company name | Acme Inc. | Yes |
| A headline for the careers page | "Step into a rewarding career" | Optional; offer two or three to choose from |
| One or two lines about the company | "A 40-person distributor of industrial supplies" | Yes |
| Up to three things that make it a good place to work | "Training paid for and done in work hours" | Optional. Leave the section out rather than invent them |
| Locations they hire in | Singapore; Remote | Yes |
| Careers inbox where applications go | careers@company.com | Yes. A shared inbox, not a personal one |
| How long to keep CVs | 6 months | Yes |
| Privacy contact for deletion requests | privacy@company.com | Yes |
| Company logo | PNG or SVG | Recommended |
| Website address | company.com | Optional |
| Whether to show pay ranges | Yes / No | Optional, default No |

**Brand colours from the logo.** If the user shares the logo and you can view images, pick a primary colour, a darker shade for buttons and a light tint for backgrounds. Show the hex codes and ask the user to confirm. If you can't view images, ask for the hex codes from their brand guide, or offer a neutral default. Check that text on the primary colour is readable (aim for a 4.5:1 contrast ratio).

**Privacy note.** Draft a short note for the apply form: what's collected, why, how long it's kept, and who to contact for deletion. Use only what the user gave you. Remind them to check it against local law (for example Singapore's PDPA). This is not legal advice.

## Step 3: Choose how applications reach the inbox

Read `reference/email-options.md` and offer the options in this order:

1. **Free, no domain needed: the company's Gmail (recommended).** Lovable's Gmail connector sends each application from the company's own careers Gmail or Google Workspace inbox, with the CV attached.
2. **Free, no email: review in chat.** Applications stay in the portal, and the user asks the assistant "who applied this week?". Good for Microsoft 365 users, or as a backup.
3. **Paid plan with their own domain.** Built-in Lovable Emails (no extra provider) or Resend, sending from an address like `jobs@company.com`.

Record the choice. It decides part of the build brief.

## Step 4: Build the portal

1. Fill in `reference/build-brief.md` with the details from Step 2 and the email choice from Step 3, and attach the reference portal files it lists.
2. Show the user a short summary of what will be built and the credits it will use. Ask for a yes.
3. Create a new Lovable project and send the brief. If the connector can't create projects, give the user the filled-in brief to paste into Lovable.
4. When the build finishes, check it against `reference/data-model.md`, especially that CV storage is **private** and the public can read only open jobs. Ask the builder to fix anything that is missing.
5. Share the preview link and ask the user to try the apply form with a test CV.

## Step 5: Connect email

Follow the steps for the chosen option in `reference/email-options.md`. Signing in to Google, or verifying a domain, is done by the user in Lovable. Afterwards, send one test application and ask the user to confirm it reached the inbox with the CV attached.

## Step 6: Publish

Ask for a yes, then publish. Give the user the live address. If they want `careers.company.com`, explain the paid-plan custom-domain steps in `reference/email-options.md` (section "Own domain").

## Step 7: Post the first job

Follow "Post a job" in `reference/everyday-tasks.md`: draft, preview, wait for yes, publish, then share the link.

## After launch

From now on, the user can just ask: "Post a job for a…", "Change the designer role to hybrid", "Close the accountant role", "Who applied for the driver role?". Use `reference/everyday-tasks.md`. Ground rule 1 applies every time.

---

Independent project, not affiliated with or endorsed by Lovable, Replit, Base44, Bolt, Google or any AI company. Product names belong to their owners. Features and plans change; check the builder's current documentation if a step doesn't match what the user sees.
