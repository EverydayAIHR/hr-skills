# Episode 1: Build a 9-Box Talent Matrix with AI (Using Your Own HR Data)

Video: _link added when published_

In this episode a fictional HR Executive, Alex Harper at Acme Inc., builds a 9-box talent matrix for the sales team using Claude. The skill and templates here are written to be used with other AI assistants too. The assistant reads the HR files in Google Drive, works out performance from the annual reviews, and uses the manager's potential assessment to place each person.

Everything about Acme is fictional.

## What the episode shows

1. Acme's HR files in Drive, set up as a small business would keep them.
2. Asking the assistant for a 9-box, and what it says is missing (the potential assessment).
3. The potential assessment form, filled in by the sales manager.
4. The assistant placing five people provisionally, with scores and levels.
5. An interactive page to go through with a manager, including what-if changes.
6. A data check that lists what is consistent and what to question.

## Files

The episode uses the skill [nine-box-talent-matrix](../../skills/nine-box-talent-matrix/SKILL.md). Its [formats](../../skills/nine-box-talent-matrix/formats) folder has three blank templates:

| File | What it is |
|---|---|
| `Annual-Performance-Evaluation-blank-template.docx` | The annual review form that gives the performance rating |
| `Talent-Matrix-Potential-Assessment-blank-template.docx` | The form the manager completes to rate potential |
| `nine-box-grid-template.html` | An empty interactive 9-box grid. Open it in a browser, add your own people and ratings, and nothing is saved or sent anywhere |

Bring your own data: the repo does not include employee records.

## Try it yourself

1. Put your own review ratings and potential assessments in a folder your assistant can read, or share them in the chat. If you do not have forms yet, start from the blank templates.
2. Give your assistant the skill (paste the contents of `SKILL.md` into the chat, or add it as a skill if your assistant supports that) and ask it to build a 9-box for your team.
3. Ask it to check the data for anything inconsistent or questionable, and to suggest fixes without changing official ratings.
4. Read the answers critically. The people involved are the ones you know.
