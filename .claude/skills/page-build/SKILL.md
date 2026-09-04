---
name: page-build
description: "Build website page work from a page-brief spec or one of its tickets: design system, polish, homepage coherence, handoff. Use when given a GitHub issue labelled page-brief, a ticket whose parent is one, or asked to build or implement a page or page section."
---

Steps 5 and 6 of the page rethink: **design** and **polish**. The issue
decides what the page says and which blocks are reuse, extend, or new. This
skill builds it to the design system and fills the Sanity draft.

The homepage is the reference point, not a ceiling. Any element this work
introduces that deserves to be a leitmotif goes to the homepage too. Using it
only here is schizoid design; rejecting it because the homepage lacks it is
dogmatic design. Both are wrong.

## Inputs

1. The issue: `gh issue view <number> --comments`. If it is a ticket, also
   read its parent spec. Extract every acceptance criterion and every section
   in scope for this issue.
2. `frontend/DESIGN.md`, whole file. The frontmatter holds the tokens, the
   body holds the named rules and the motion grammar.
3. `docs/avatars.md`, the profiles of the avatars named in the spec.
4. `docs/agents/page-builder.md` before touching any block.
5. The homepage as built: the `homePage` block list in Sanity and the
   renderers in `frontend/components/blocks/`. Read the ones this work reuses
   or sits beside.
6. The homepage critique at `frontend/prototype/.impeccable/critique/`:
   known weaknesses to avoid repeating.
7. `CLAUDE.md` rules on Sanity writes (backup first) and fast verification.

Branch hygiene: never work on `main`. Branch from a fresh `main` with a name
that carries the issue number.

## Step 5: Design

Build the plan in the issue.

1. Blocks: follow `docs/agents/page-builder.md` for every `new` and
   `extend`. Keep schema, GROQ projection, and renderer in sync. Run TypeGen
   once shapes settle.
2. Styling: tokens and named rules from `DESIGN.md`. One accent, forest
   fields, pills, hairlines, tonal depth. Alternate field colours like day and
   night on the lake. Desktop and 375px both designed, not one derived.
3. Content: back up the dataset per `CLAUDE.md`, then write every section in
   scope to the page's **draft** in Sanity with the spec's copy direction and
   `CONTEXT.md` "Copy voice". Populate every required field. Use real images
   from the dataset when they exist; list the missing ones in the handoff.
4. Metadata when the whole page is in scope: title, description, OG image on
   the page document.

## Step 6: Polish

Walk the result once on desktop and once at 375px against `DESIGN.md`
"Motion grammar" and "Don't". Confirm:

- focus states on every interactive element;
- `prefers-reduced-motion` honoured, no infinite loops;
- images sized for the slot, alt text present;
- one CTA per avatar, as the spec states, visible without hover;
- jargon explained where first used.

Then the coherence check. For each element the spec marked as a homepage
candidate, or that emerged during the build: add it to the homepage in this
branch when small, otherwise open an issue labelled `homepage-coherence`
naming the element and the page that introduced it.

## Verify and hand off

Run only the smallest check that catches a type or generated-code failure:
`pnpm typecheck`, and `pnpm verify:typegen` if schemas changed. Add a focused
test only where the spec's Testing Decisions ask for one. Fix what fails.

Hand off to Ovi with:

- the frontend URL for this worktree's dev server with draft mode enabled;
- the Studio Presentation URL for the page document:
  `<studio url>/presentation?preview=/<slug>` (ports come from
  `pnpm dev:worktree`);
- viewports to check, desktop and 375px;
- the actions to take, and what should happen;
- content written as draft placeholder, and images still needed.

Ovi's report is the visual verdict. When he accepts, open a PR that closes
the issue (`/theo-file-pr`). The work is done when the PR is merged, the
draft is published by Ovi, and any `homepage-coherence` issue exists.
