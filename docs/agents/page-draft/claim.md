# Claim: resolve the target and take the card

One agent. Input: a target, or none.

- Nothing: the top card in the To Build column is the page.
- Slug or old-site URL: strip the host, match `slug.current` in Sanity with
  `perspective: "raw"` (the page may exist only as a draft), then find the
  card whose body carries that slug. A page with no document yet is a new
  page: record the intended slug and title; the seed creates it.
- Basecamp card URL: read the card; the slug is on it.
- Issue number: the spec exists. Read it for slug and title, then find the card.

Then run the claim protocol from `page-workflow.md` before any other write.
The branch is the current worktree's branch (`git branch --show-current`).

Read the card's `Spec issue` line. When it names an open issue, or the target
was an issue number, return that number: the script skips gather and decide.

Return `claimed` with the card in Building and this branch on it;
`owned-elsewhere` when another session holds it (say which branch in the
note); `not-found` when no page and no card match (say what was searched).
