# Page workflow: from the old page to a draft, several pages at once

Facts about this repo for the `page-draft` workflow (`.claude/workflows/`,
step instructions in `.claude/workflows/page-draft/`) and the
`page-integrate` skill. They hold the process; this file holds what is true
about this repo, its Basecamp project, and its content database. Update it here when any of it changes.

## Stages

A page moves through these stages. Basecamp is the tracker; one card per page
in the page tracker card table.

| Stage | Basecamp column | Who moves it |
|---|---|---|
| Backlog | Backlog | Ovi |
| To build next | To Build | Ovi (top card is next) |
| Draft in progress | Building | `page-draft`, as its first write (taking the page) |
| Ready for Ovi | Ovi Polish | `page-draft`, when it hands the page over |
| Ready for client feedback | Client review | Ovi, after polish and merge |
| Accepted | Published | Ovi, after publishing |
| Rejected | Rejected. | Ovi |

A **draft** is what `page-draft` leaves behind: the plan written as a GitHub
issue, the code on a pushed branch, the page text saved as a draft in Sanity,
and the card in Ovi Polish. Ovi's polish
and the client's feedback come after; neither is the draft's job.

## Basecamp

- Account `6230954`, project "CAC" `48063970`. No `.basecamp/config.json`, so
  every command carries `--in 48063970 --account 6230954`.
- Page tracker card table `10092471266`. Column ids on 2026-09-05: Backlog
  `10092471267`, To Build `10274031872`, Building `10092471270`, Ovi Polish
  `10274031944`, Client review `10274032020`, Published `10092471271`,
  Rejected. `10092471268`. Titles get renamed; resolve a column by title with
  `basecamp cards columns --card-table 10092471266` before moving a card.
- Card body, one line each, kept current by the skills:
  `Slug`, `Sanity id`, `Tier`, `Primary avatars`, `Secondary`, `Spec issue`,
  `Branch`, `PR`, `Client input` (link to the to-do list). Avatar names link to
  the avatar documents in the Design folder (`docs/avatars.md` names them).
- Client facts and media the camp must supply go on one to-do list per page,
  titled `Client input: <page title>`, in the project's to-dos. One to-do per
  fact or asset, so the client can tick them.
- Update a card body with `basecamp cards update <id> --body '<html>'`
  (`--content` is not a flag), move it with
  `basecamp cards move <id> --to <column id>`, and comment with
  `basecamp comments create <id> - --in ...` reading Markdown from stdin.

## Taking a page so nobody else works on it

Sessions running at the same time share Basecamp, GitHub issues, the Sanity
content database, and `origin`. Nothing locks any of them, so the workflow
takes the page on the card before it writes anything:

1. Read the card and its comments. A card already in Building or Ovi Polish
   with a `Branch:` line from another session, or with a "Taking this page"
   comment from another branch, is taken: report it and stop.
2. Post a comment on the card: "Taking this page. Branch: `<branch>`,
   worktree: `<path>`." Comments only append, so they keep their order.
   Re-read the comments. If another "Taking this page" comment sits above
   yours, that session was first: stop, and touch nothing else.
3. Only then move the card to Building and add the `Branch:` line to the
   card body. The body is one field that the last writer overwrites, which
   is why it is written after the claim is settled, not before.
4. Search open issues for `Page: … (/<slug>)` before saving a plan, and reuse
   an existing one. Two sessions filed duplicate tickets for the Family Guide
   on 2026-09-04; this step exists because of that.

## Branches and integration

- Work on the branch the worktree was created with (T3 Code names it
  `t3code/<name>`). On `main`, branch to `page/<slug>` first.
- Run `pnpm sync:main` before the first commit and again before the final
  push. It merges `origin/main`, regenerates Sanity types, and union-merges
  the generator-marker registrations. It stops on any other conflict and
  says which files need a hand.
- Push the branch. Do not open a PR per page. `page-integrate` merges every
  branch in Ovi Polish into one integration branch (`pnpm merge:refs
  origin/<branch>…`), runs the gate once, and opens one PR. Ovi polishes on
  that branch with every draft visible on one dev server.
- Generated files (`studio/schema.json`, `frontend/sanity.types.ts`) are never
  hand-merged. Take either side and run `pnpm typegen`.

## Rules for working in parallel

These are the rules that keep two drafts from undoing each other. Each one
paid for itself on 2026-09-04, when three sessions redesigned `storyFeature`
and two of them threw their work away.

**Code is additive.** A page branch adds new blocks, adds optional fields to
existing blocks, and adds documents. It renames nothing, retypes nothing, and
removes nothing. A shape change to a shared block is its own PR on a quiet
main, never part of a page draft.

**Blocks in flight are locked.** Before designing or extending an existing
block, list the files other unmerged branches touch:

```bash
git fetch --quiet origin
for b in $(git branch -r --format='%(refname:short)' | grep -v -e HEAD -e origin/main); do
  git log --format= --name-only origin/main..$b | grep -E '^(frontend/components/blocks|frontend/sanity/queries|studio/schemas/blocks)/' | sed "s|^|$b |"
done | sort -u
```

A renderer, query, or schema file that appears in that list belongs to
another branch. Use the block as it is on `main`, or make a new block.

**"Reuse" means designed.** A spec's `reuse` mark is a claim to verify: open
the renderer and look for the design system (`text-headline`,
`bg-forest-floor`, `container-content`, the eyebrow-headline-script opening).
A renderer still on starter utility classes is undesigned; treat it as
`design` (design it in this branch, if it is not locked) or choose another
block. Starter blocks still undesigned on 2026-09-05: `richTextBlock`,
`teamMembers`, `latestArticles`. Every other block on `main` has a designed
renderer.

**The dataset is shared and live.** Every branch reads the same `production`
dataset. A draft written by one branch is visible to every other branch's dev
server, and a document whose shape only one branch's schema understands will
show as invalid everywhere else until that branch merges. So:

- write drafts only; publish nothing;
- write only this page's document and documents created for it (FAQs,
  testimonials, redirects) with deterministic ids scoped to the page, e.g.
  `faq-airport-return-flight`, `testimonial-placeholder-madrid-parent`;
- the `homePage`, `navigation`, `settings`, and `footer` documents belong to
  nobody's draft. Nav label or description changes, and homepage candidates,
  go in the spec issue and the handoff, not the dataset;
- use a new block's stored shape only on this page's draft until it merges;
- back up before the first write (`sanity dataset export production
  backups/production-<timestamp>-<slug>.tar.gz --raw`, then `gzip -t`).

## Scripts

| Command | What it does |
|---|---|
| `pnpm legacy:page <slug>` | Old site content for the page, as text. Starting point, never a template. |
| `pnpm page:text <slug>` | The current draft (or published page) as a reader meets it. Proofread copy here. |
| `pnpm page:seed <seed.mjs> [--apply]` | Write the page draft and its supporting drafts from a seed module. Dry run without `--apply`. Helpers in `studio/scripts/lib/portable-text.mjs`. |
| `pnpm page-builder:new <name>` | Generate and register a new block's schema, query, and renderer. |
| `pnpm sync:main` | Merge `origin/main` with generated files and marker registrations resolved. |
| `pnpm merge:refs <ref>…` | Same, for any refs; used by `page-integrate`. |
| `pnpm dev:worktree` | Website and Studio on this worktree's port slot. `pnpm dev:stop --here` stops them. |
| `pnpm typecheck`, `pnpm verify:typegen` | The cheap checks after code changes. |

Seed modules and dataset backups live under `backups/` (gitignored). A seed
hardcodes asset ids and is stale the moment Ovi edits in Studio, so it stays
out of git.

## Loading a draft without a browser

Sanity Presentation needs a browser, but a server render of the draft catches
a renderer crash or a missing field before handoff:

1. Start `pnpm dev:worktree` (or reuse the running one; `pnpm dev:stop` lists
   them) and note the Website port.
2. From `frontend/`, create a preview secret with a short node script:
   `createPreviewSecret(client, "page-draft", studioUrl)` from
   `@sanity/preview-url-secret/create-secret` (the package resolves from the
   repo root under `node_modules/.pnpm/`; use the `@sanity/client` the
   frontend uses, with the `SANITY_AUTH_TOKEN` from `studio/.env.local`).
3. `curl -c jar "http://127.0.0.1:<port>/api/draft-mode/enable?sanity-preview-secret=<secret>&sanity-preview-pathname=/<slug>"`
   (expect 307), then `curl -b jar http://127.0.0.1:<port>/<slug>`.
4. Grep the HTML for every section's heading text and for a 500 or "Application
   error". The `<title>` shows the site default because metadata reads the
   published perspective; that is expected.

The Sanity CLI's `documents query` returns published documents only. Read
drafts from a script with `getCliClient(...).fetch(query, params,
{ perspective: "raw" })`, as `studio/scripts/print-page-text.mjs` does.
`sanity documents validate --yes --level warning --format ndjson` validates
drafts too; grep the output for the page id.

## Finish checklist

The draft is done when all of these are true:

- the plan exists as a GitHub issue with the decisions and their basis, labelled
  `page-brief` and `ready-for-agent`, and the Basecamp card links it;
- the branch is pushed, `pnpm sync:main` is clean, `pnpm typecheck` passes,
  and `pnpm verify:typegen` passes when schemas changed;
- the page draft holds every section in the spec, every required field filled,
  every link resolving, camp-supplied facts marked `(camp to confirm)`;
- `pnpm page:text <slug>` reads like the site's voice, with the banned words
  from `CONTEXT.md` "Copy voice" absent and jargon explained at first use;
- the `Client input: <page>` to-do list holds every fact and asset the camp
  must supply;
- the card sits in Ovi Polish with `Branch`, `Spec issue`, and `Client input`
  filled, and a comment listing: sections that need Ovi's design pass (every
  `new` and `design` block), placeholder content, missing images, and the
  Studio path `/presentation?preview=/<slug>`;
- a `homepage-coherence` issue exists when the spec named homepage candidates.
