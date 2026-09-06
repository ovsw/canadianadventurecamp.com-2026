# Step 1: Take the page

The main agent running `/page-draft` does this itself. Input: a target, or
nothing. About ten commands; every one you need is written below with its
flags. Basecamp ids are in `page-workflow.md` "Basecamp".

## First: which checkout this is

Run `git worktree list`. Its first line is the main checkout. If the current
directory is that line, or `git branch --show-current` prints `main`, return
`wrong-checkout` and say in the note to open a worktree and run again. A run
in the main checkout leaves it sitting on a page branch, and a second run
started there joins the first run's page instead of taking its own. That
happened on 2026-09-05: two runs drafted Health & Safety at the same time in
the same checkout, and fought over one plan, one seed file, and one draft.

Then run `git branch --show-current; pwd` once. The two lines it prints
are the branch and the worktree. Write them into the commands below as
literal text; do not put `$(git ...)` or `$PWD` inside another command, and
do not run either again. Every later stage gets both from you.

## Which page this is

- Nothing given: the top card in the "To Build" column that has no "Taking
  this page" comment. Skip every card that has one, whatever branch or
  worktree the comment names.
- A slug or an old-site URL: strip the host. `pnpm page:text <slug>` prints
  the page's document id and title when the page exists, as a draft or
  published, or "No page with slug" when it does not. Then find the card
  whose body carries that slug. No page document means a new page: write
  down the slug and title it should have; the page text step will create it.
- A Basecamp card URL: read the card; the slug is on it.
- A number: it is the plan's GitHub issue. `gh issue view <n> --json
  title,body` for the slug and title, then find the card.

## Take it

A "Taking this page" comment you did not write in this step belongs to
another run, even when it names this branch or this worktree. You did not
write it, so the run that did is still going. Never treat one as your own.

1. Columns, to resolve ids by title:
   `basecamp cards columns --card-table 10092471266 --in 48063970 --account 6230954 --json`
2. Cards in To Build, in order:
   `basecamp cards list --column 10274031872 --in 48063970 --account 6230954 --json`
3. The card and its comments:
   `basecamp cards show <id> --in 48063970 --account 6230954 --json`
   `basecamp comments list <id> --in 48063970 --account 6230954 --json`
   Comments are under `data`, oldest first; `content` is HTML.
4. If any comment says "Taking this page": with a target given, return
   `someone-else-has-it` and name that branch; with nothing given, go back to
   step 2 and take the next card.
5. Claim, from stdin, with the branch and worktree written in as text:

   ```bash
   printf 'Taking this page. Branch: `<branch>`, worktree: `<worktree>`.\n' | basecamp comments create <id> - --in 48063970 --account 6230954 --json
   ```

6. Read the comments again (step 3). If another "Taking this page" comment
   sits above yours, that run was first: return `someone-else-has-it`.
7. Move the card to Building:
   `basecamp cards move <id> --to 10092471270 --in 48063970 --account 6230954 --json`
8. Add the `Branch:` line to the body. The body is one HTML field that the
   last writer overwrites, so take `data.content` from step 3, add
   `<br>Branch: <branch>` inside the last paragraph, and keep every other
   line exactly as it was:
   `basecamp cards update <id> --in 48063970 --account 6230954 --body "$BODY" --json`

## Is the plan already written

Read the card's `Spec issue` line. If it names an open GitHub issue, or the
target was an issue number, keep that number: research and planning are
skipped. Otherwise search once,
`gh issue list --search "Page: (/<slug>)" --state open --json number,title`,
and return the number if one matches the slug. Return 0 when there is none.

## The outcome

`taken` when your comment is the first "Taking this page" comment on the
card, the card is in Building, and the body carries this branch. Keep the
slug without a leading slash (`programs/specialty-summer-camp-programs`,
not `/programs/...`), and the worktree as the absolute path `pwd` printed.
`someone-else-has-it` when another run has the page; name the branch.
`not-found` when no page and no card match; say what you searched.
`wrong-checkout` when this is the main checkout. In the last three cases
stop, touch nothing, and tell Ovi.
