# Step 5: Hand over to Ovi

One agent, after the code is pushed. Inputs: the page details, the plan's
section list, the page text results, any proofreading problems left open, the
result of loading the page, and the notes for Ovi from every build step.

1. Move the Basecamp card to "Ovi Polish". Fill the body lines listed in
   `page-workflow.md` "Basecamp": `Slug`, `Sanity id`, `Tier`,
   `Primary avatars`, `Secondary`, `Spec issue`, `Branch`, `PR` (empty),
   `Client input`.
2. Write one comment on the card with the hand-over: the sections Ovi should
   design himself (every section that was built new or redesigned, by name),
   placeholder text, missing photos, proofreading problems left open, and the
   Studio path `/presentation?preview=/<slug>`.
3. Write a second comment on the card titled **For Ovi**, with four headings
   and one bullet per item, so nothing an agent guessed passes as settled:
   - **Decisions for a human**: choices with more than one good answer, the
     option taken, and why. Sources: the plan's "Decisions made without Ovi"
     and every `decision:` line the build steps returned.
   - **Please review**: work a human should look at before it ships: first
     passes at design, text written without a source, a section used in a new
     way. Source: the `review:` lines.
   - **Check with the camp**: facts, numbers, dates, prices, and names the
     site could not confirm. Sources: the plan's "Open questions for the
     client", every `(camp to confirm)` in the page text, and the `client:`
     lines. These also become the to-dos in step 4.
   - **Assumptions and educated guesses**: what an agent assumed to keep
     moving. Source: the `assumption:` lines.
   Merge duplicates. Keep the step name in brackets so Ovi can trace each
   line. An empty heading says "none".
4. Make the to-do list `Client input: <page title>`, one to-do per fact or
   photo the camp must supply, taken from "Check with the camp".
5. Comment on the plan's GitHub issue with the same hand-over, the For Ovi
   list, and the branch name.
6. Open one `homepage-coherence` issue per homepage candidate named in the
   plan, saying which element and which page. The homepage document is never
   edited from a page branch.

Go through the finish checklist in `page-workflow.md` line by line before
returning. Return every URL you created and a summary Ovi can read in one
minute: branch, plan issue, card, Studio path, the sections he should design,
and what the camp must supply.
