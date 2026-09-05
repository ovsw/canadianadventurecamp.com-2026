# Step 3: Write the plan

One agent writes the plan. Then a second agent reads it as the parent it is
written for and lists the problems, and a third agent fixes them. The second
reader then reads the fixed plan again. That goes round up to three times, or
until the second reader finds nothing. Problems found in the third
round go into the notes for Ovi.

Inputs are the five sets of notes from the research step. For every decision
below, write the answer you would have recommended to Ovi, and the reader
line, fact, or rule it rests on. A decision without a basis is a guess: find
the fact, or mark the gap as a question for the camp. The whole set of
decisions becomes the plan, saved as a GitHub issue.

Order matters: the content decides which page section to use, never the
other way round. Settle parts 1 to 3 before you look at the list of existing
sections.

## Part 1: Who the page is for

Which readers the page serves, which one comes first, and which ones it
deliberately ignores. Start from the page's row in `docs/avatars.md` and
deviate only with a reason from the profiles. Rachel never sees the fit quiz.
Maya never gets a form.

## Part 2: What each reader is trying to do

For each chosen reader: where they arrive from (the menu, a homepage
section, a search, the quiz, a link a kid sent), what they are trying to get
done, what they must believe when they leave, where they are in the decision
(first look, comparing camps, ready to enrol), and the one call to action
that fits. Use the "confident enough" list in each profile for what they must
believe. Calls to action come from the funnel document: Enroll, Talk to the
Directors, the fit quiz section, or none.

## Part 3: What the page says

- The questions the page answers, in order, one per section, in the main
  reader's order (their "Top questions" list, cut down to this page).
- The proof behind each answer: a fact, a number, a photo, a quote, a name.
  A fact the old site never states is a question for the camp: write it into
  the text as `(camp to confirm)` and onto the list for the camp. Invent
  nothing that `frontend/PRODUCT.md` says not to invent.
- The direction for the writing: the one thing the page says plainly; the
  camp words to explain the first time they appear (Twinkie, Winits, Big Top,
  CACmail, UM, eTA, tuck); the trust wording from "Copy voice".
- The photo or video for each section, and whether it exists (asset id or
  public path). A missing photo becomes a note in the hand-over, never a
  broken link.
- What the old page said that this page drops, and where that content goes.
- Site-wide facts this page needs that are missing everywhere (a price, an
  age range, a phone number, opening hours). Name them; do not solve them
  here.
- Ideas from this page that the homepage should echo.

Interactive behaviour is welcome when it helps a reader get something done.
Describe it in plain words, with the job it serves.

## Part 4: How the page is laid out

For each section: two sentences on desktop and on a phone (375px wide), and
one of these four labels:

- **reuse**: an existing section, used as it is. It must already be designed.
- **extend**: an existing section gains an optional field or variant. Add
  only; change nothing that exists.
- **design**: an existing section whose look was never designed. This branch
  designs it to `DESIGN.md`.
- **new**: a section that does not exist yet.

Check every "reuse" against the section's code, following the "Reuse means
designed" rule. A section another branch is editing is used exactly as it is
on `main`, or replaced. Plan the background colours now so they alternate
(dark, cream, dark, and so on; money, trust, and forms on cream), and so the
page opens with a hero section and each section opens with the small
heading, the big heading, and the script line.

## Save the plan

Search the open GitHub issues for `Page: … (/<slug>)` first and reuse one if
it exists. Otherwise `gh issue create` with the labels `page-brief` and
`ready-for-agent`, the title `Page: <page title> (/<slug>)`, and this body:

```markdown
## Problem Statement
What the old page fails to do for its readers, from their point of view.

## Solution
What the new page does for them. One paragraph.

## Page
Slug, tier, Sanity document id, menu group and neighbours, Basecamp card,
branch. Menu label or description changes the page needs (written down, not
applied).

## Avatars
Main and secondary readers with the reason; readers ignored and why.

## Jobs
Per reader: arrives from, wants to get done, must believe on exit, stage,
call to action.

## User Stories
Numbered. "As a <reader>, I want <thing on this page>, so that <benefit>."
Every section and every call to action has one.

## Content outline
The sections in order. For each: the question it answers, the proof, the
direction for the writing, the photo (exists or missing), any behaviour, the
background colour, and its label (reuse <section> / extend <section> /
design <section> / new).

## Copy notes
The plain statement. Camp words to explain. Trust wording. Facts marked
`(camp to confirm)`.

## Implementation Decisions
New, designed, and extended sections with their fields described in prose.
Layout on desktop and on a phone. Behaviour. No file paths, no code.

## Decisions made without Ovi
Every choice with more than one good answer: the options, the one taken, and
why. This is the part Ovi reads first.

## Testing Decisions
Focused tests only, per `CLAUDE.md` "Fast verification"; otherwise "Ovi's
visual verdict".

## Dropped from the old page
What, and where it went.

## Shared content dependencies
Site-wide gaps this page needs filled.

## Homepage candidates
Ideas or elements that should also appear on the homepage.

## Out of Scope

## Open questions for the client
Only what the site cannot answer on its own; the same list goes to the camp.

## Sources
Reader profiles, old page, posts, documents consulted.
```

Add the issue link to the card's `Spec issue` line. Done when the link is on
the card.

## The second reader

A second agent reads the saved plan the way the main reader would, and
against the rules, and returns problems only, each with a fix:

- one of the main reader's top questions that no section answers;
- a section whose proof is missing or invented (check against the "do not
  fabricate" list and the verified facts);
- a call to action that breaks the funnel document or a reader rule (Rachel
  and the quiz, Maya and forms);
- a "reuse" label on a section that is not designed, or that another branch
  is editing;
- two cream backgrounds next to each other, or a page that does not open
  with a hero;
- a banned word from "Copy voice" in the writing direction;
- an entry in "Decisions made without Ovi" with no reason given.

"No problems" is a valid answer. Style and taste are not problems.

## Fix the plan

When the second reader found problems, a third agent applies each fix to the
issue with `gh issue edit`, adds one line per fix under "Decisions made
without Ovi", and returns the section list again. Then the second reader
reads the plan again. Up to three rounds.
