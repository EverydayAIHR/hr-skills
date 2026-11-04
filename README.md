# hr-skills

Claude skills and sample data for HR teams, from the **Everyday AI in HR** YouTube series (@EverydayAIHR).

Each episode shows how an HR person can use Claude on a real task. The reusable part is a skill you can copy into your own Claude. The demo files for each episode sit in their own folder.

> **All companies, people and figures in the samples are fictional.** Acme Inc., Marendia and everyone at Acme are invented for the series. Nothing here is real employee data or professional advice. Check anything you use against your own policies and local law.

## Episodes

| # | Episode | Skill | Demo files |
|---|---|---|---|
| 1 | Build a 9-Box Talent Matrix with Claude (Using Your Own HR Data) | [nine-box-talent-matrix](skills/nine-box-talent-matrix/SKILL.md) | [episodes/01-nine-box-talent-matrix](episodes/01-nine-box-talent-matrix) |

Video links are added to each episode folder when the video is published.

## Layout

```
skills/            one folder per skill: SKILL.md plus any blank templates it uses
episodes/          demo material for each episode
.claude-plugin/    lets the repo be installed as a plugin
```

## Using a skill

Copy a skill folder from `skills/` into your own Claude skills, or install the repo as a plugin. Then ask Claude for the task in plain language, for example: "Build a 9-box talent matrix for my sales team from the files in my Drive."

Claude's results vary from run to run. The skills are a starting point. HR judgement stays with you, because you know your organisation, your people and what is normal there.

## Licence

MIT. See [LICENSE](LICENSE).
