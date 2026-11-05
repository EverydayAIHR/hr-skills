# hr-skills

AI assistant skills and blank templates for HR teams, from the **Everyday AI in HR** YouTube series (@EverydayAIHR). Written to be used with Claude, ChatGPT and other AI assistants.

Each episode shows how an HR person can use an AI assistant on a real task. The reusable part is a skill: a plain-text set of instructions you can give to the assistant you already use. The episode material sits in its own folder.

> **All companies, people and figures in the samples are fictional.** Acme Inc., Marendia and everyone at Acme are invented for the series. Nothing here is real employee data or professional advice. Check anything you use against your own policies and local law.

## Episodes

| # | Episode | Skill | Demo files |
|---|---|---|---|
| 1 | Build a 9-Box Talent Matrix with AI (Using Your Own HR Data) | [nine-box-talent-matrix](skills/nine-box-talent-matrix/SKILL.md) | [episodes/01-nine-box-talent-matrix](episodes/01-nine-box-talent-matrix) |

Video links are added to each episode folder when the video is published.

## Layout

```
skills/            one folder per skill: SKILL.md (the instructions) plus any blank templates it uses
episodes/          demo material for each episode
.claude-plugin/    optional: lets Claude Code and Claude install the repo as a plugin
```

## Using a skill with your AI assistant

A skill is just a Markdown file (`SKILL.md`) written in plain language, so any assistant that can read instructions can follow it. Pick the route that fits yours:

- **Any assistant (for example ChatGPT or Claude):** Open `SKILL.md`, copy its contents and paste them into a new chat, or into your assistant's custom instructions or project instructions if it has them. Then share your files (or connect your drive, if your assistant can) and ask in plain language, for example: "Using the instructions above, build a 9-box talent matrix for my sales team from the files I've shared."
- **Assistants that support skills (for example Claude):** Copy the skill folder from `skills/` into your skills, or install the repo as a plugin.
- **No files to share?** The blank forms in the skill's `formats/` folder are a starting point. Fill them in, then share them with your assistant.

Results vary between assistants and between runs. The skills are a starting point. HR judgement stays with you, because you know your organisation, your people and what is normal there.

Independent project: not affiliated with, or endorsed by, any AI company. Product names belong to their owners.

## Licence

MIT. See [LICENSE](LICENSE).
