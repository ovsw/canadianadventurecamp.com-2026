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
3. The `Client input: <page title>` to-do list, one to-do per fact or asset
   from the spec's "Open questions for the client" and the seed's
   `(camp to confirm)` markers.
4. A comment on the spec issue with the same handoff and the branch name.
5. A `homepage-coherence` issue per homepage candidate in the spec, naming
   the element and this page. The homepage document is never edited from a
   page branch.

Check the handoff checklist in `page-workflow.md` line by line before
returning. Return every URL you created and a summary Ovi can read in one
minute: branch, issue, card, Studio path, design-pass sections, what the camp
must supply.
