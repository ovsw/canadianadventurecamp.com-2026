# Decide: avatar, jobs, content, layout

Steps 1 to 4 of the page rethink, run without Ovi. For every decision below,
write the answer you would have recommended to him and the avatar line, fact,
or rule it rests on. A decision without a basis is a guess; find the fact or
mark the gap as a client question. The whole set of decisions becomes the
spec issue.

Order matters: content decides the block, never the reverse. Settle steps 1
to 3 before opening `studio/schemas/blocks/`.

## Step 1: Avatar

Which avatars the page serves, which is primary, which it deliberately
ignores. Default to the matrix row in `docs/avatars.md`; deviate only with a
reason from the profiles. Rachel never sees the fit quiz. Maya never gets a
form.

## Step 2: Jobs

Per chosen avatar: where they arrive from (nav, homepage block, search, quiz,
a link a kid sent), what they are trying to get done, what they must believe
on exit, their lifecycle stage, and the single CTA that fits. Use the
"confident enough" list in each profile as the exit beliefs. CTAs come from
the funnel ADR: Enroll, Talk to the Directors, fit quiz block, or none.

## Step 3: Content

- The ordered questions the page answers, one per section, in the primary
  avatar's order (their "Top questions" list, filtered to this page).
- The proof behind each answer: a fact, number, photo, quote, name. A fact the
  old site never states is a client question, written into the copy as
  `(camp to confirm)` and onto the client input list. Invent nothing that
  `frontend/PRODUCT.md` lists as not to fabricate.
- Copy direction: the one thing the page says plainly; jargon to explain at
  first use (Twinkie, Winits, Big Top, CACmail, UM, eTA, tuck); trust
  language from "Copy voice".
- Media per section, and whether it exists (asset id or public path). A
  missing photo becomes a placeholder note in the handoff, never a broken
  reference.
- What the old page said that this page drops, and where it goes.
- Shared content the page depends on that is missing site-wide (price, age
  range, phone, hours). Name it; do not solve it here.
- Leitmotif candidates for the homepage.

Interactive behaviour is welcome when it serves a job. Describe it in plain
words with the job it serves.

## Step 4: Layout

For each section, two sentences on desktop and 375px, and one mark:

- **reuse**: an existing designed block, as-is;
- **extend**: an existing block gains an optional field or variant
  (additive only);
- **design**: an existing block whose renderer is still undesigned; this
  branch designs it to `DESIGN.md`;
- **new**: a block that does not exist.

Verify every `reuse` against the renderer, per the "Reuse means designed"
rule. A block on the lock list is `reuse` as it is on `main` or it is
replaced. Plan the field colours now so the Dusk Alternation Rule holds
(dark, cream, dark…; money, trust, and forms on cream) and the page opens
with a hero block and one eyebrow-headline-script triad per section.


## File the spec

Search open issues for `Page: … (/<slug>)` first and reuse one if it exists.
Otherwise `gh issue create` with labels `page-brief` and `ready-for-agent`,
title `Page: <page title> (/<slug>)`, body:

```markdown
## Problem Statement
What the old page fails to do for its avatars, from their perspective.

## Solution
What the new page does for them. One paragraph.

## Page
Slug, tier, Sanity document id, nav group and neighbours, Basecamp card,
branch. Nav label or description changes the page needs (recorded, not
applied).

## Avatars
Primary and secondary with the basis; avatars ignored and why.

## Jobs
Per avatar: arrives from, wants to get done, must believe on exit, stage, CTA.

## User Stories
Numbered. "As a <avatar>, I want <thing on this page>, so that <benefit>."
Every section and every CTA has one.

## Content outline
Ordered sections. For each: the question it answers, the proof, the copy
direction, media (asset or missing), behaviour, field colour, and its mark
(reuse <block> / extend <block> / design <block> / new).

## Copy notes
The plain statement. Jargon to explain. Trust language. Facts marked
`(camp to confirm)`.

## Implementation Decisions
New, designed, and extended blocks with their content model in prose.
Layout intent on desktop and 375px. Behaviour. No file paths, no code.

## Decisions made without Ovi
Every choice with more than one defensible answer: the options, the one
taken, and why. This is the section Ovi reads first when polishing.

## Testing Decisions
Focused tests only per `CLAUDE.md` "Fast verification"; otherwise "Ovi's
visual verdict".

## Dropped from the old page
What, and where it went.

## Shared content dependencies
Site-wide gaps this page needs filled.

## Homepage candidates
Leitmotifs or elements that should also appear on the homepage.

## Out of Scope

## Open questions for the client
Only what the site cannot answer on its own; mirrored on the client input list.

## Sources
Avatars, legacy page, posts, docs consulted.
```

Update the card body with `Spec issue`. Done when the issue URL is on the
card.

## Critic

A second agent reads the filed issue through the primary avatar's eyes and
against the rules, and returns problems only, each with a fix:

- a top question of the primary avatar that no section answers;
- a section whose proof is missing or invented (check against the
  do-not-fabricate list and the verified facts);
- a CTA that breaks the funnel ADR or an avatar rule (Rachel and the quiz,
  Maya and forms);
- a `reuse` mark on an undesigned or locked block;
- two cream fields touching, or a page that does not open with a hero;
- a banned word from "Copy voice" in the copy direction;
- a decision in "Decisions made without Ovi" with no basis.

No problems is a valid answer. Style and taste are not problems.

## Revise

When the critic returned problems, a third agent applies each fix to the
issue with `gh issue edit`, adds a line per fix under "Decisions made without
Ovi", and returns the outline again. One round; the critic does not run twice.
