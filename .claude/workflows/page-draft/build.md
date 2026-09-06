# Step 4: Build

One agent per heading below, run in this order by the script. The plan
decides what the page says and which sections are reused, extended,
designed, or new. This step builds them to the design system, writes the
page text into Sanity as a draft, and checks the result the way Ovi would on
his first read.

Design is the one part Ovi wants to do himself. Your job on "new" and
"design" sections is a faithful first pass to `DESIGN.md` that loads, reads
well, and keeps the page's rhythm. His job is the polish. Name every such
section in the hand-over so he knows where to look.

Every heading below returns "notes for Ovi": one line per thing you assumed,
guessed, decided on your own, or could not confirm, each starting with
`decision:`, `review:`, `client:`, or `assumption:`.

Every command you need is written under its heading with its flags. Run no
`--help`. Do not read the other headings' sources: what the plan writer
checked (that a "reuse" section is designed, that the backgrounds alternate)
stays checked.

## Get ready

Three things, about eight commands, nothing else:

1. `pnpm sync:main`. Fix anything it reports.
2. The lock scan, one command, from `page-workflow.md` "Blocks in flight are
   locked":

   ```bash
   git fetch --quiet origin
   for b in $(git branch -r --format='%(refname:short)' | grep -v -e HEAD -e origin/main); do
     git log --format= --name-only origin/main..$b | grep -E '^(frontend/components/blocks|frontend/sanity/queries|studio/schemas/blocks)/' | sed "s|^|$b |"
   done | sort -u
   ```

   A section on that list that the plan marks `design` or `extend` is used
   exactly as it is on `main`, or replaced. If that changes a section's
   label, edit the plan's outline (`gh issue view <n> --json body -q .body >
   <file>`, edit, `gh issue edit <n> --body-file <file>`), add the reason
   under "Decisions made without Ovi", and return the updated section list.
   Do not open the renderers to check "reuse" labels; the plan writer did.
3. Back up the content database before anything is written. A **raw** export
   (the documents with their links to images, not the image files) into
   `backups/` at the repo root, which git ignores:

   ```bash
   cd studio && SANITY_AUTH_TOKEN=$(grep '^SANITY_AUTH_TOKEN=' .env.local | cut -d= -f2-) \
     pnpm exec sanity dataset export production ../backups/production-$(date -u +%Y%m%d%H%M%S)-<slug>.tar.gz --raw
   gzip -t backups/production-*-<slug>.tar.gz
   ```

   Never write the archive anywhere git tracks. A failed export or check
   stops the build.

Return `ok: false` with the reason when the sync, the lock scan, or the
backup fails. The script stops the run and writes the reason on the card.

## Build one section

One agent per section labelled "new", "design", or "extend", in that order,
one after the other. Read `docs/agents/page-builder.md`, `frontend/DESIGN.md`,
the code of the section you build, and of the sections it sits next to on
this page. Then:

- **new**: `pnpm page-builder:new <name> --title "<Studio title>"`, then
  replace the starter fields with the fields the plan describes. Keep the
  Sanity schema, the GROQ query, and the React component in step. Every item
  in a list gets a `_key`.
- **design**: rewrite the React component to `DESIGN.md`; keep the schema and
  the query as they are unless the plan extends them.
- **extend**: add optional fields only. Content already saved must keep
  validating without a migration.
- Run `pnpm typegen` once the shapes settle. Never edit generated files.
- Styling: the tokens and the named rules in `DESIGN.md`. One accent colour,
  alternating backgrounds, hairlines, pills, the small heading then the big
  heading then the script line, motion that reveals under
  `animation-timeline: view()` and pauses under `prefers-reduced-motion`, a
  focus ring on everything interactive. Designed for desktop and for a
  375px phone.
- Skip the Studio grid preview image; say so in your notes for Ovi.
- Commit the section on its own (`feat(<section>): …`).

Done when `pnpm typecheck` passes and `pnpm verify:typegen` passes. Return the
files you touched and whether the type check passed.

## Write the page text and save the draft

Your sources are in the prompt: the research notes (readers, writing rules,
the old page, posts, neighbours, sections and fields, photos) and the plan's
section list. Read, once each: the plan (`gh issue view <n> --json body -q
.body`), `studio/scripts/lib/portable-text.mjs`, one existing seed under
`backups/seeds/` as the pattern if there is one, and the schema file under
`studio/schemas/blocks/` of each section you write, for its field names.
Nothing else: not `docs/avatars.md`, not `CONTEXT.md`, not `DESIGN.md`, not
the renderers, not the old page. On 2026-09-05 the writer spent thirty
commands re-reading those before writing a word.

Write the page as a seed file at `backups/seeds/<slug>.mjs`. Run
`pnpm page:seed backups/seeds/<slug>.mjs` once as a dry run, then again with
`--apply`.

- Every section in the plan, in order, every required field filled, every
  list item keyed with a readable key (`hero-b1`, `trip-3`). Each section's
  eyebrow carries the plan's name for that section, so the page and the
  plan use the same names.
- Text in the site's voice: the notes' writing rules, the plan's copy notes,
  "warm, confident, parent-to-parent". Write the accent phrase of each
  heading as the `em` span, one per section.
- Run the `unslop` skill over the text before saving. Cut what a machine
  would write; keep what a camp parent would say to another.
- Facts the camp must supply read `(camp to confirm)` in the text. Prices
  and counts that do not exist read `[N]` or `[price]` with that marker.
- Photos from the notes by asset id, with alt text written for the slot. A
  slot with no photo stays empty and goes on the missing list.
- Links: internal links point at existing document ids (the notes name the
  neighbours; check an id you are unsure of with one query); external links
  only for CampBrain, the fit quiz path, mailto, tel.
- Supporting documents (FAQs, testimonials, a redirect for a renamed slug)
  with fixed ids scoped to the page, saved as drafts, in the same seed file.
- Page metadata when the whole page is in scope: title, description, SEO
  title and description, header image.

Done when the seed applied without a revision error and
`pnpm page:text <slug>` shows every section. Validate once from `studio/`:
`pnpm exec sanity documents validate --yes --level warning --format ndjson
2>&1 | grep <page id>` should print nothing. Return the seed path, the
document ids written, the placeholders, and the missing photos.

## Proofread

One agent reads the page the way Ovi reads a hand-over and returns problems
only, each with where it is and the fix. Sources: `pnpm page:text <slug>`,
the plan (`gh issue view <n> --json body -q .body`, once), and the notes on
who the page is for, in the prompt. Nothing else.

A problem is one of these:

1. A fact stated as certain that the sources never confirm, or a fact the
   text upgrades (a doctor who "issues" prescriptions does not "fill" them).
2. A sentence that does not parse, or says the opposite of what it means.
3. A word on the "Copy voice" avoid list, from the notes.
4. A camp word not explained the first time it appears.
5. A call to action the plan does not allow for that reader, or an "Enroll"
   that does not say it opens CampBrain.
6. A section from the plan missing or out of order, a required field empty,
   a link that does not resolve, two cream backgrounds touching.

Wording, rhythm, numbering, a label's length, a repeated idea, and anything
you would merely have written differently are not problems. Run the
`unslop` skill over the text and report only what it flags as machine-like,
not what it would tighten. Expect a handful; a list of twenty says the bar
was set too low.

## Fix

One agent applies the fixes: to the seed file and then `pnpm page:seed
backups/seeds/<slug>.mjs --apply`, or to the code. Commit any code change.
The script runs a second proofread only when the first found more than
eight problems. What the last proofread found is fixed but not proofread
again; the hand-over lists it as unchecked.

## Load the page and check it

One agent, one attempt, no fixing. Follow `page-workflow.md` "Loading a draft
without a browser". The headings to look for are the ones the draft holds,
from `pnpm page:text <slug>`, never the plan's outline names. Return `ok`
only when the page answered 200, the HTML holds no "Application error" and
no "Internal Server Error", and every heading was found. Otherwise return
the headings not found and the errors seen; the script writes them for Ovi
and carries on. Do not edit the seed, the code, or the draft to make the
check pass.

## Push the code

`pnpm sync:main`, then `pnpm typecheck` and `pnpm verify:typegen`. Fix what
fails. Commit anything uncommitted with a Conventional Commit message and push
the branch. When the branch has no commits of its own (every section was
reused), there is nothing to push: return the head SHA and say so. Do not
open a pull request; `page-integrate` opens one for the whole batch. Run
focused tests only where the plan's Testing Decisions ask for them. Return
the head commit SHA.
