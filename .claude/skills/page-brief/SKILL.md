---
name: page-brief
description: "Rethink one website page with Ovi (avatar, jobs, content, layout) and file the spec as a GitHub issue. Usage: /page-brief <slug>"
disable-model-invocation: true
---

Steps 1 to 4 of the page rethink: **avatar**, **jobs**, **content**,
**layout**. The result is a page spec in one GitHub issue, sized so the next
step is clear: build it in one session, or break it into tickets first.
Design and polish happen later, from that issue, through `page-build`.

The old page is a starting point, never a template. Existing Page Builder
blocks never decide what a page says. Blog posts are out of scope; they migrate
as-is.

## Inputs

Gather all of these before the first question. Facts are your job, decisions
are Ovi's.

1. `docs/avatars.md`: the page's row in the matrix, and the full profile of
   every avatar marked P or S there. Note the page's tier.
2. `CONTEXT.md`, sections "Conversion funnel" and "Copy voice".
3. `docs/adr/0001-conversion-funnel-and-header-ctas.md`.
4. The old page content:
   `cd studio && SANITY_AUTH_TOKEN=$(grep SANITY_AUTH_TOKEN .env.local | cut -d= -f2) pnpm legacy:page <slug>`
5. Blog posts on the page's topic. Query `post` titles and excerpts in Sanity
   (project and dataset from `studio/.env.local`) and keep the ones that hold
   facts or stories the page could use.
6. The page's neighbours: the other pages in its nav group, read from the
   `navigation` document in Sanity (`items[].label` and each item's links).
   The spec can move content between neighbours instead of repeating it.
7. The existing blocks: names and fields in `studio/schemas/blocks/`, and the
   homepage block list from the `homePage` document. Needed for step 4 only.

## The interview

Open with a one-paragraph read of the old page: what it tries to do, which
avatar questions it answers, which it leaves open. Cite the avatar gap lists.

Then run the interview in **rounds**. Each round asks the whole **frontier**:
every question whose prerequisites are settled. Number each question and give
your recommended answer:

```
❓ **Q1** - **<title>**: <question, with choices where useful>

➡️ <recommended answer, with the fact or avatar line it rests on>
```

Recompute the frontier after every round. A question whose answer depends on
an open one waits for the next round. The interview is done when the frontier
is empty and Ovi confirms the decisions read as his.

### Step 1: Avatar

Which avatars this page serves, which one is primary, which it deliberately
ignores.

### Step 2: Jobs

For each chosen avatar: what they are trying to get done when they land here,
where they arrive from (nav, homepage, search, quiz, a link a kid sent), what
they must believe when they leave, and which single CTA fits them. Use the
lifecycle stages from `docs/avatars.md`.

### Step 3: Content

- The ordered list of questions the page answers, one per section, in the
  order the primary avatar asks them.
- The proof behind each answer: a fact, a number, a photo, a quote, a name.
  Mark proof the camp must supply.
- Copy direction: the one thing this page says plainly, jargon to explain
  (Twinkie, Winits, Big Top), trust language per "Copy voice".
- Media: what each section needs and whether it exists. Check
  `frontend/public/images/` and Sanity image assets by alt text.
- What the old page said that this page drops, and where that content goes
  instead (another page, shared content, nowhere).
- Shared content this page depends on that is missing site-wide (price,
  availability, age range, phone). Name it; do not solve it here.
- Ideas that could become a site-wide leitmotif. Flag them for the homepage.

Interactive or novel behaviour is welcome when it serves a job. Describe it in
plain words, with the job it serves.

### Step 4: Layout

Only after content is settled. For each section, sketch desktop and 375px in
two sentences and mark it as one of:

- **reuse**: an existing block, as-is;
- **extend**: an existing block gains a field or variant;
- **new**: a block that does not exist yet.

Content decides the block, never the reverse. If a section wants a shape no
block has, the answer is `new`. Present the whole plan as one round with
recommendations, including homepage back-propagation candidates.

## Size the work

Count the plan. **One-shot** when there are no `new` blocks and at most one
`extend`; the whole page fits one session. **Ticketed** otherwise; a new
block is one vertical slice (schema, query, renderer, preview, typegen, draft
content) and fits one context window on its own, but several plus page
assembly do not. State the size and the route in the spec.

## File the spec

Create the issue with `gh issue create`, labels `page-brief` and
`ready-for-agent`, title `Page: <page title> (/<slug>)`. Use the `to-spec`
template with the page sections added:

```markdown
## Problem Statement
What the old page fails to do for its avatars, from their perspective.

## Solution
What the new page does for them, from their perspective. One paragraph.

## Page
Slug, tier, Sanity document id, nav group, size (one-shot or ticketed) and
the route (`page-build` directly, or `/to-tickets` first).

## Avatars
Primary and secondary, one line each on why. Avatars ignored, and why.

## Jobs
Per avatar: arrives from, wants to get done, must believe on exit, CTA.

## User Stories
Numbered, extensive. "As a <avatar>, I want <thing on this page>, so that
<benefit>." Cover every section and every CTA.

## Content outline
Ordered sections. For each: the question it answers, the proof it shows,
the copy direction, media needed, behaviour if any, and its block mark
(reuse <block> / extend <block> / new).

## Copy notes
The plain statement. Jargon to explain. Trust language to use. Facts the
camp must confirm.

## Implementation Decisions
New and extended blocks with their content model in prose. Layout intent
on desktop and 375px. Behaviour. No file paths, no code.

## Testing Decisions
What deserves a focused test per CLAUDE.md "Fast verification" (subtle pure
logic, accessibility of interactive behaviour). Otherwise state "Ovi's visual
verdict".

## Dropped from the old page
What, and where it went.

## Shared content dependencies
Site-wide gaps this page needs filled.

## Homepage candidates
Leitmotifs or elements that should also appear on the homepage.

## Out of Scope

## Open questions for the client
Only what the site cannot answer on its own.

## Sources
Avatars, legacy page, posts, and any doc consulted.
```

Return the issue URL and the route: `page-build <issue>` for a one-shot, or
`/to-tickets <issue>` then `/implement-spec` for a ticketed page.
