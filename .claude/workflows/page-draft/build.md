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

## Get ready

1. `pnpm sync:main`. Fix anything it reports.
2. List the sections other branches are editing, following `page-workflow.md`
   "Rules for working in parallel". A section on that list is used exactly as
   it is on `main`, or replaced in the plan. If that changes a section's
   label, edit the plan's outline, add the reason under "Decisions made
   without Ovi", and return the updated section list.
3. Read `docs/agents/page-builder.md`, the whole of `frontend/DESIGN.md`, the
   code of the sections the page reuses, and of the sections it will sit
   next to.
4. Back up the content database before anything is written. Use a **raw**
   export (the documents, with their links to images, but not the image files
   themselves) into the `backups/` folder at the repo root, which git
   ignores:
   `sanity dataset export production backups/production-<timestamp>-<slug>.tar.gz --raw`
   with `SANITY_AUTH_TOKEN` from `studio/.env.local`. Then check the archive
   with `gzip -t`. Never write the archive anywhere git tracks. A failed
   export or check stops the build.

Return `ok: false` with the reason when the sync, the check for other
branches, or the backup fails. The script stops the run and writes the reason
on the card.

## Build one section

One agent per section labelled "new", "design", or "extend", in that order,
one after the other. Follow `docs/agents/page-builder.md`:

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

Write the page as a seed file at `backups/seeds/<slug>.mjs` using the helpers
in `studio/scripts/lib/portable-text.mjs`. Run
`pnpm page:seed backups/seeds/<slug>.mjs` once as a dry run, then again with
`--apply`.

- Every section in the plan, in order, every required field filled, every
  list item keyed with a readable key (`hero-b1`, `trip-3`).
- Text in the site's voice: `CONTEXT.md` "Copy voice", the plan's copy notes,
  and `DESIGN.md` "warm, confident, parent-to-parent". Write the accent phrase
  of each heading as the `em` span, one per section.
- Run the `unslop` skill over the text before saving. Cut what a machine
  would write; keep what a camp parent would say to another.
- Facts the camp must supply read `(camp to confirm)` in the text. Prices
  and counts that do not exist read `[N]` or `[price]` with that marker.
- Photos from Sanity by asset id, with alt text written for the slot. A slot
  with no photo stays empty and goes on the missing list.
- Links: internal links point at existing document ids (check each with a
  query); external links only for CampBrain, the fit quiz path, mailto, tel.
- Supporting documents (FAQs, testimonials, a redirect for a renamed slug)
  with fixed ids scoped to the page, saved as drafts, in the same seed file.
- Page metadata when the whole page is in scope: title, description, SEO
  title and description, header image.

Done when the seed applied without a revision error and
`sanity documents validate` reports nothing for the page id and its
documents. Return the document ids written, the placeholders, and the
missing photos.

## Proofread

One agent reads the page the way Ovi reads a hand-over and returns problems
only, each with where it is and the fix:

1. `pnpm page:text <slug>`. Read every line. Flag text that sounds like a
   press release or a chatbot, any word on the "Copy voice" avoid list, a
   camp word not explained the first time it appears, a fact stated as
   certain that the camp never confirmed, a joke that makes the camp sound
   like anything but a camp. Run the `unslop` skill over the output.
2. Background rhythm: list the sections' background colours. Dark and cream
   alternate; two creams never touch.
3. Calls to action: one per reader as the plan says, visible without hover,
   every "Enroll" saying it opens CampBrain.
4. Every required field filled, every link resolving, every section from the
   plan present and in order.

## Fix

One agent applies the fixes: to the seed file and then `pnpm page:seed …
--apply`, or to the code. Commit. The script runs proofread and fix up to
three times; whatever is left goes into the hand-over as still open.

## Load the page and check it

Follow `page-workflow.md` "Loading a draft without a browser": start or reuse
the worktree's dev server, turn on draft mode with a preview secret, fetch
`/<slug>`, and search the HTML for every section heading and for a 500 or
"Application error". Return the headings not found and the errors seen. If
it fails, a fixer runs once, then this check runs again.

## Push the code

`pnpm sync:main`, then `pnpm typecheck` and `pnpm verify:typegen`. Fix what
fails. Commit anything uncommitted with a Conventional Commit message and push
the branch. Do not open a pull request; `page-integrate` opens one for the
whole batch. Run focused tests only where the plan's Testing Decisions ask
for them. Return the head commit SHA.
