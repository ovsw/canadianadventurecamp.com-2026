# Step 5: Hand over to Ovi

One agent, after the code is pushed. Inputs, all in the prompt: the page
details, the plan's section list, the page text results, the proofreading
problems left open, the result of loading the page, and the notes for Ovi
from every build step. Read the plan once (`gh issue view <n> --json body -q
.body`) for "Decisions made without Ovi", "Open questions for the client",
and "Homepage candidates". Read nothing else: not other cards, not other
issues, not the code. Every command is below with its flags; run no
`--help`. About twenty commands.

The Studio path is `http://localhost:<studioPort>/presentation?preview=/<slug>`
with `studioPort` from `.worktree-ports.json` in the worktree root, written
by `pnpm dev:worktree`. If the file is missing, `pnpm dev:stop` with no flags
lists the running servers and their ports.

1. Move the card to "Ovi Polish" and fill the body. The body is one HTML
   field that the last writer overwrites, so read it first and change only
   the lines named in `page-workflow.md` "Basecamp": `Slug`, `Sanity id`,
   `Tier`, `Primary avatars`, `Secondary`, `Spec issue`, `Branch`, `PR`
   (empty), `Client input` (the to-do list from step 4, so make that first
   if you prefer).
   `basecamp cards show <id> --in 48063970 --account 6230954 --json`
   `basecamp cards update <id> --in 48063970 --account 6230954 --body "$BODY" --json`
   `basecamp cards move <id> --to 10274031944 --in 48063970 --account 6230954 --json`
2. Write one comment on the card with the hand-over: the sections Ovi should
   design himself (every section that was built new or redesigned, by name),
   placeholder text, missing photos, proofreading problems left open, whether
   the page loaded cleanly, and the Studio path. Markdown from stdin:
   `basecamp comments create <id> - --in 48063970 --account 6230954 --json < <file>`
3. Write a second comment on the card titled **For Ovi**, with four headings
   and one bullet per item, so nothing an agent guessed passes as settled:
   - **Decisions for a human**: choices with more than one good answer, the
     option taken, and why. Sources: the plan's "Decisions made without Ovi"
     and every `decision:` line the build steps returned.
   - **Please review**: work a human should look at before it ships: first
     passes at design, text written without a source, a section used in a new
     way, a page that did not load cleanly. Source: the `review:` lines.
   - **Check with the camp**: facts, numbers, dates, prices, and names the
     site could not confirm. Sources: the plan's "Open questions for the
     client", every `(camp to confirm)` in the page text, and the `client:`
     lines. These also become the to-dos in step 4.
   - **Assumptions and educated guesses**: what an agent assumed to keep
     moving. Source: the `assumption:` lines.
   Merge duplicates. Keep the step name in brackets so Ovi can trace each
   line. An empty heading says "none".
4. Make the to-do list `Client input: <page title>`, one to-do per fact or
   photo the camp must supply, taken from "Check with the camp":
   `basecamp todolists create "Client input: <page title>" --in 48063970 --account 6230954 -d "Facts to confirm and media to supply for /<slug>. Spec: GitHub issue #<n>." --json`
   (the list id is `data.id`), then one per item:
   `basecamp todos create "<text>" --list <list id> --in 48063970 --account 6230954 --json`
5. Comment on the plan's GitHub issue with the same hand-over, the For Ovi
   list, and the branch name: `gh issue comment <n> --body-file <file>`.
6. Open one `homepage-coherence` issue per homepage candidate named in the
   plan, saying which element and which page:
   `gh issue create --title "Homepage coherence: <element> from <page title>" --label homepage-coherence --body-file <file>`.
   The homepage document is never edited from a page branch.

Then go through the finish checklist in `page-workflow.md` line by line from
what you already know; run a command only for a line you cannot answer.
Return every URL you created and a summary Ovi can read in one minute:
branch, plan issue, card, Studio path, the sections he should design, and
what the camp must supply.
