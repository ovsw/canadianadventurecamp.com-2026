# Hand off

One agent, after the branch is pushed. Inputs: the claim, the spec outline,
the seed result, the review issues left unresolved, the render result.

1. Basecamp card to Ovi Polish. Body lines filled per `page-workflow.md`
   "Basecamp": `Slug`, `Sanity id`, `Tier`, `Primary avatars`, `Secondary`,
   `Spec issue`, `Branch`, `PR` (empty), `Client input`.
2. One comment on the card with the handoff: sections that need Ovi's design
   pass (every `new` and `design` block, named), placeholder content, missing
   images, review issues left unresolved, and the Studio path
   `/presentation?preview=/<slug>`.
3. A second comment on the card titled **For Ovi**, with four headings and
   one bullet per item, so nothing an agent guessed passes as settled:
   - **Decisions for a human**: choices with more than one defensible answer,
     the option taken, and why. Source: the spec's "Decisions made without
     Ovi" and every `decision:` line the build stages returned.
   - **Please review**: work a human should look at before it ships: design
     first passes, copy written without a source, a block used in a new way.
     Source: `review:` lines.
   - **Check with the client**: facts, numbers, dates, prices, and names the
     site could not confirm. Source: the spec's "Open questions for the
     client", every `(camp to confirm)` in the seed, and `client:` lines.
     These also become the to-dos in step 4.
   - **Assumptions and educated guesses**: what an agent assumed to keep
     moving. Source: `assumption:` lines.
   Merge duplicates; keep the stage name in brackets so Ovi can trace each
   line. An empty heading stays with "none".
4. The `Client input: <page title>` to-do list, one to-do per fact or asset
   from the spec's "Open questions for the client" and the seed's
   `(camp to confirm)` markers.
5. A comment on the spec issue with the same handoff, the For Ovi list, and the branch name.
6. A `homepage-coherence` issue per homepage candidate in the spec, naming
   the element and this page. The homepage document is never edited from a
   page branch.

Check the handoff checklist in `page-workflow.md` line by line before
returning. Return every URL you created and a summary Ovi can read in one
minute: branch, issue, card, Studio path, design-pass sections, what the camp
must supply.
