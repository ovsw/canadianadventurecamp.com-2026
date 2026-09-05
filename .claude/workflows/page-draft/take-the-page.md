# Step 1: Take the page

One agent. Input: a target, or nothing.

Find out which page this is:

- Nothing given: the top card in the "To Build" column is the page.
- A slug or an old-site URL: strip the host, then look up the page in Sanity
  by `slug.current`, reading with `perspective: "raw"` because the page may
  exist only as a draft. Then find the Basecamp card whose body carries that
  slug. If there is no page document yet, this is a new page: write down the
  slug and title it should have; the page text step will create it.
- A Basecamp card URL: read the card; the slug is on it.
- A number: it is the plan's GitHub issue. Read it for the slug and title,
  then find the card.

Then take the page, following "Taking a page so nobody else works on it" in
`page-workflow.md`, before writing anything else. The branch is the current
worktree's branch (`git branch --show-current`).

Read the card's `Spec issue` line. If it names an open GitHub issue, or the
target was an issue number, return that number: the plan is already written,
so the script skips research and planning.

Return `taken` when the card is marked in progress with this branch on it.
Return `someone-else-has-it` when another session is already working on the
page, and say which branch in the note. Return `not-found` when no page and
no card match, and say what you searched.
