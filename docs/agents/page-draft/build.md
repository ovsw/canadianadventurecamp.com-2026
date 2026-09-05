# Build: blocks, design system, draft content, self-review

Steps 5 and 6 of the page rethink, run without Ovi, one agent per section
below. The spec decides what the page says and which blocks are reuse, extend, design, or new. This file
builds it to the design system and fills the Sanity draft, then checks the
result the way Ovi would on his first read.

Design is the one step Ovi wants to do with a human in the loop. Your job on
`new` and `design` blocks is a faithful first pass to `DESIGN.md` that
renders, reads, and holds the page's rhythm; his job is the polish. Name every
such section in the handoff so he knows where to look.

## Prep

1. `pnpm sync:main`. Fix anything it reports.
2. Re-run the block lock list from `page-workflow.md`. A block another branch
   touches is used as it is on `main` or replaced in the spec (edit the issue
   and the outline; say so in "Decisions made without Ovi").
3. Read `docs/agents/page-builder.md`, `frontend/DESIGN.md` whole, the
   renderers the page reuses, and the ones it will sit beside.
4. Back up the dataset per `page-workflow.md`; `gzip -t` the archive. A failed
   backup stops the build.
5. When the lock list forces a mark to change (a `design` block another branch
   holds becomes `reuse` as on `main`, or a new block), edit the issue's
   outline, add the reason under "Decisions made without Ovi", and return the
   updated section list.

Return `ok: false` with the reason when the sync, the lock check, or the
backup fails. The script stops the run and reports it on the card.

## Blocks

One agent per block marked `new`, `design`, or `extend`, in that order,
one after the other. Follow `docs/agents/page-builder.md`:

- `new`: `pnpm page-builder:new <name> --title "<Studio title>"`, then
  replace the starter fields with the spec's content model. Keep schema, GROQ
  projection, and renderer in sync. Every array item type gets a `_key`.
- `design`: rewrite the renderer to `DESIGN.md`; keep schema and query as
  they are unless the spec extends them.
- `extend`: add optional fields only. Existing stored documents keep
  validating without a migration.
- Run `pnpm typegen` once the shapes settle; never edit generated files.
- Styling: tokens and named rules from `DESIGN.md`. One accent, the dusk
  alternation, hairlines, pills, the eyebrow-headline-script opening, motion
  that reveals under `animation-timeline: view()` and pauses under
  `prefers-reduced-motion`, a focus ring on everything interactive. Desktop
  and 375px both designed.
- Skip the Studio grid preview image; note it in the handoff.
- Commit the block on its own (`feat(<block>): …`).

Done when `pnpm typecheck` passes and `pnpm verify:typegen` passes. Return
the files touched and whether typecheck passed.

## Seed

Write the page as a seed module at `backups/seeds/<slug>.mjs` using the
helpers in `studio/scripts/lib/portable-text.mjs`, then
`pnpm page:seed backups/seeds/<slug>.mjs` (dry run) and again with `--apply`.

- Every section in the spec, in order, every required field filled, every
  array item keyed with a readable key (`hero-b1`, `trip-3`).
- Copy in the site's voice: `CONTEXT.md` "Copy voice", the spec's copy
  notes, `DESIGN.md` "warm, confident, parent-to-parent". Write the accent
  phrase of each heading as the `em` span; one per section.
- Run the `unslop` skill over the copy before seeding. Cut what a machine
  would write; keep what a camp parent would say to another.
- Facts the camp must supply read as `(camp to confirm)` inline; prices and
  counts that do not exist read as `[N]` or `[price]` with the marker.
- Images from the dataset by asset id, alt text written for the slot. A slot
  with no photo stays empty and goes on the missing list.
- Links: internal references to existing document ids (verify each with a
  query); external URLs only for CampBrain, the fit quiz path, mailto, tel.
- Supporting documents (FAQs, testimonials, a redirect for a renamed slug)
  with page-scoped deterministic ids, as drafts, in the same seed.
- Page metadata when the whole page is in scope: title, description, SEO
  title and description, header image.

Done when the seed applied without a revision error and
`sanity documents validate` reports nothing for the page id and its documents.
Return the document ids written, the placeholders, and the missing images.

## Review

A checker agent reads the page the way Ovi reads a handoff, and returns
problems only, each with where it is and the fix:

1. `pnpm page:text <slug>`. Read every line. Copy that sounds like a press
   release or a chatbot, any word on the "Copy voice" avoid list, jargon
   unexplained at first use, a fact stated as certain that the camp never
   confirmed, a joke that makes the camp sound like anything but a camp. Run
   the `unslop` skill over the output.
2. Field rhythm: list the sections' field colours; dark and cream alternate,
   two creams never touch.
3. CTAs: one per avatar as the spec states, visible without hover, every
   Enroll saying it opens CampBrain.
4. Every required field filled, every link resolving, every spec section
   present in order.

A fixer agent applies the fixes to the seed and re-applies it, or to the
code, and commits. The script repeats checker and fixer up to three rounds;
what is left goes in the handoff as unresolved.

## Render check

Per `page-workflow.md` "Rendering a draft without a browser": start or reuse
the worktree's dev server, enable draft mode with a preview secret, fetch
`/<slug>`, grep for every section heading and for a 500 or "Application
error". Return the headings not found and the errors seen. A fixer runs once
on failure, then the check runs again.

## Push

`pnpm sync:main`, then `pnpm typecheck` and `pnpm verify:typegen`. Fix what
fails. Commit anything uncommitted with a Conventional Commit and push the
branch (no PR; `page-integrate` files one for the batch). Focused tests only
where the spec's Testing Decisions ask. Return the head SHA.
