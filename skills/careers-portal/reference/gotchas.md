# Gotchas

Read this when something doesn't work, or before you change the portal or the database rules. Each one came up while building and testing this skill.

## Reaching the files

- **github.com pages may not open for you.** Some assistants can't read `github.com/.../tree/...` or `.../blob/...` pages. Use the raw links in `SKILL.md` (`raw.githubusercontent.com/...`), which return plain file text.
- **Don't summarise the reference files when passing them on.** When you give the portal to the app builder, include each file's full text. A summary loses the design.

## Lovable

- **The connector may not be on in this chat.** If no Lovable tools are available, check before saying it can't be done. In Claude, the user turns it on from the **+** menu under Connectors. Without it, the user can paste the brief into Lovable's own chat; everything else in the skill still works.
- **Agent messages cost credits; database checks don't need the agent.** Creating a project or sending a message to Lovable's agent uses workspace credits. Running the self-check or posting a job uses the database tool instead.
- **A build can pause and wait for a decision.** If Lovable stops with a question or an approval (for example, turning on Cloud or connecting Gmail), show the user exactly what it asks. Don't answer it by sending a new message; that cancels the pending step.
- **Some steps only the user can do in Lovable:** signing in to Google for Gmail, buying a plan, connecting a domain, and entering secret keys. Give the editor link and wait.
- **A preview link isn't proof the build finished.** Check the build is done, then run the self-check, then try the form.
- **Run the schema as one migration, unchanged.** If Lovable rewrites the access rules, run `check-portal.sql` and fix every FAIL before publishing.

## Database rules (Supabase)

- **Row rules aren't column rules.** The public can read open jobs, but should only see the public columns (not `apply_email`). That's done with column grants in `schema.sql`. Revoking one column while the table-wide grant remains does nothing.
- **Deleting a storage row doesn't delete the file.** CVs must be deleted through the Storage API (a scheduled server function), then the application row. `delete_expired_applications()` only removes rows.
- **Upload first, then save the application.** The website can't delete anything, so if saving fails after an upload, the file is left behind. The daily clean-up removes it. The other order would leave an application with no CV.
- **The CV path is checked.** The application must point to `{job_id}/{application_id}/cv.{ext}`, matching the uploaded file. If you change the folder layout, change the policy, the portal and `check-portal.sql` together.

## Email

- **Resend without a verified domain only reaches the account owner.** It looks like it works in testing (you get the email), then candidates' applications to other inboxes fail. Use Gmail or review in chat until a domain is verified.
- **Gmail sends as one shared account.** Use a shared careers inbox, never someone's personal mailbox.

## Design

- **Brand colours can make buttons unreadable.** The portal picks white or dark text on the brand colour automatically. If a company's colour is very light (yellow, pastel), suggest a darker shade for buttons.
- **Don't invent "Working here" points or pay.** Leave the section out, or pay hidden, unless the user gave them.
- **Headlines.** Offer two or three plain options ("Step into a rewarding career", "Grow with us"). Don't promise anything the company didn't state.
