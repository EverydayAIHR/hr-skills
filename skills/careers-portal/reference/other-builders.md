# Using another app builder

Lovable is the default because its connector lets the assistant change job rows directly. The same portal can be built elsewhere. Use the same `build-brief.md` and `data-model.md`; only the tool names and the email step differ.

| | Lovable | Replit | Base44 | Bolt |
|---|---|---|---|---|
| Connect it to the assistant | Lovable MCP server (Claude, ChatGPT, Cursor, VS Code) | Replit connector (Claude, ChatGPT) | Base44 MCP server (Claude, ChatGPT, Cursor) | No connector for outside assistants found; build in Bolt's own chat |
| File storage for CVs | Lovable Cloud storage | Replit App Storage | Built-in file storage | Bolt Cloud storage |
| Post a job from the assistant | Direct database change | Through the Replit Agent (prompt) | Through the app's own MCP (App MCP) | Not from the assistant; use the portal's admin page |
| Email without own domain | Gmail connector | Check Replit's Gmail integration | Gmail connector (Builder plan or higher) | Check Bolt's integrations |

Check each builder's current documentation before relying on a row. Features change often.

## Replit

1. The user creates a Replit account and connects Replit in their assistant (in Claude: Connectors → Replit → Connect, then sign in).
2. Create the app from the build brief (Replit's `create_app_from_prompt`). Ask for Replit App Storage for CVs and a private bucket.
3. Job changes go through the Replit Agent (`update_app_using_prompt`), for example "Add an open job: Warehouse Supervisor…". Each one is an agent run, so it uses Replit credits and is slower than a direct database change.
4. Tip: ask the build to include a password-protected admin page for jobs, so the HR person has a manual route as well.
5. Publish when the user says yes.

## Base44

1. The user creates a Base44 account and connects the Base44 MCP server in their assistant.
2. Build the app from the brief. Use Base44's built-in data and file storage, with CVs private.
3. For job changes, turn on the app's **App MCP** after publishing and give the assistant access to the `jobs` data only, plus read access to `applications`. The assistant then posts and closes jobs through the app itself.
4. For email without an own domain, use Base44's Gmail connector (needs the Builder plan or higher).

## Bolt

1. Build the portal in Bolt (bolt.new) by pasting the build brief into its chat. Use Bolt Cloud's database and storage, with CVs private.
2. We found no Bolt connector that lets an outside assistant change the app, so ask the brief to include a **password-protected admin page** where HR posts, edits and closes jobs.
3. The assistant can still help: draft the job ad, then the user pastes it into the admin page.

Note: "Bolt" here is bolt.new by StackBlitz, not the payments company Bolt, which has its own unrelated MCP server.
