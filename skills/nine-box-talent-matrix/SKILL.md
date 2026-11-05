---
name: nine-box-talent-matrix
description: Build a 9-box talent matrix for a team from annual performance reviews and a potential assessment. Use when an HR person or manager asks for a 9-box, talent matrix, or performance-and-potential review, or wants existing 9-box data checked.
---

# 9-box talent matrix

_These instructions are written for any AI assistant. The frontmatter above is for tools that load skills automatically; if you are pasting this into a chat, you can ignore it._

Place each person in one of nine boxes using two things: **performance** (what they have delivered) and **potential** (how likely they are to grow into a bigger role over the next 2 to 3 years). The result starts a conversation about development. It is not a pay, promotion or disciplinary decision.

## What you need before you start

1. **Annual performance reviews**: the overall rating for each person, ideally for the last three years.
2. **A potential assessment** for each person, completed by their manager: five criteria, each rated 1 (Low), 2 (Medium) or 3 (High), each with a specific example from the last 12 to 24 months.
3. **Supporting records** (optional but useful): results against targets, the employee master, career wishes recorded in one-to-one conversations.

If the user has no performance or potential form yet, offer the blank formats in the `formats/` folder of this skill (online: https://github.com/EverydayAIHR/hr-skills/tree/main/skills/nine-box-talent-matrix/formats): an annual performance evaluation form, a talent matrix potential assessment form, and an empty interactive 9-box grid. Explain they are starting points to adapt to the company's own policy. They contain no data.

Look for these in the files the user has shared or connected first. If something is missing, say exactly what is missing and who can provide it. Do not fill gaps with guesses.

## Step 1: Performance score

- Convert each overall review rating to points: Exceeds = 3, Meets = 2, Below = 1.
- Average the years that exist. A person with fewer reviews is averaged over the years they have. Say so when it applies.
- Use the overall rating on the review. Do not replace it with sales or output figures. Results are evidence behind a rating, not the rating itself.
- Do not re-judge official ratings. If one looks wrong, flag it (see Step 5).

## Step 2: Potential score

- The five criteria are: learning agility, drive and ambition, influence and leadership, handling bigger scope, adaptability and resilience.
- Potential is one current judgement per person, not one per year.
- The potential score is the average of the five ratings.
- **Never invent a potential rating.** If the assessment is missing for someone, leave them off the matrix and say why.
- Someone with less than a year at the company, or no annual review yet, is not placed. Say when their first assessment is due.

## Step 3: Levels

Use the company's own cut-offs if the form states them. Otherwise default to:

| Score | Level |
|---|---|
| 2.50 or more | High |
| 1.75 to 2.49 | Medium |
| Below 1.75 | Low |

Apply the same cut-offs to performance and potential. State the cut-offs used.

## Step 4: Place in the box

Performance runs across, potential runs up.

| | Low performance | Medium performance | High performance |
|---|---|---|---|
| **High potential** | Rough diamond | Future star | Star |
| **Medium potential** | Inconsistent | Core player | High performer |
| **Low potential** | Risk | Effective | Trusted expert |

Show each person's two scores and levels next to the box so the placement can be checked.

## Step 5: Check the data before presenting

Cross-check the reviews, the assessment and the supporting records. Report what is consistent as well as what is not. Look for:

- Scores that do not recompute from the ratings.
- Ratings that are not applied consistently across people (compare overall ratings with goal ratings and results, year by year).
- A rating that conflicts with other evidence, such as a low influence score beside Exceeds teamwork reviews.
- Ratings with no example behind them.
- Scores within about 0.15 of a cut-off. These deserve a second look, and a manager override needs a written reason.
- Contradictory career fields, or role names that do not exist yet.
- Actions from earlier reviews that reappear without a note on whether they were done.
- Records that disagree with each other, such as job titles or dates.

For each issue: show the evidence, say how it would change someone's placement, and suggest who should resolve it.

## Guardrails

- **Do not change official ratings.** Propose changes and say who approves them (usually the assessing manager, then the senior leader who calibrates).
- Every placement is provisional until the senior leader's calibration. Label the output that way.
- Rate behaviour and evidence only. Length of service, age, gender, nationality, family situation and working pattern must not move a rating.
- A low score describes the present evidence and wishes. It does not make someone less valuable. A top performer who does not want a bigger role is a trusted expert, not a problem.
- Treat individual results as sensitive. Show them only to the person who asked.
- Say what you did not read or could not check.

## Output

Give the user:

1. A short table of each person: performance score and level, potential score and level, box.
2. Anyone left off, and why.
3. A short list of questions to resolve, most important first.
4. If the user asks, an interactive page or slide for the discussion with their manager, marked "Provisional: pending calibration".

If the manager wants to try a different criterion, weighting or cut-off, run it as a what-if and label it clearly. It must not replace the assessed ratings.
