# Page draft: one page from the old site to a draft, with nobody in the loop

`/page-draft` is a dynamic workflow: `page-draft.js` beside this folder. It
takes a page of the old Canadian Adventure Camp site to a **draft**: a spec
issue, code on a pushed branch, draft content in Sanity, and the Basecamp
card in Ovi Polish. Ovi is away for the whole run. Every question the old
interactive skills asked him, the stage agent answers with the recommendation
it would have given, and records the answer and the fact it rests on.

The script holds the plan and the data between stages. Each stage is a fresh
agent that reads this folder's file for its stage, does that stage, and
returns structured data. Whatever an agent learned and did not return is gone,
so every stage fills its schema completely.

## Run it

```text
/page-draft family-guide
/page-draft https://canadianadventurecamp.com/family-guide
/page-draft https://app.basecamp.com/6230954/buckets/48063970/card_tables/cards/<id>
/page-draft 57          an existing spec issue: gather and decide are skipped
/page-draft             the top card in the To Build column
```

`args` can also be an object `{ target, stopAfter }`. `stopAfter` is `claim`,
`gather`, or `spec`; `stopAfter: "spec"` files the spec and stops, which is
what the old `spec-only` flag did.

One page per worktree. Several worktrees draft several pages at once; the
claim protocol in `docs/agents/page-workflow.md` keeps them apart. A run uses
about fifteen agents, so set the workflow size guideline to `large` or the
task panel shows a warning. A stopped run resumes from cache in the same
session: ask Claude to relaunch it.

## Stages

| Phase | Agents | Instructions | Returns to the script |
|---|---|---|---|
| Claim | 1 | `claim.md` | slug, page id, card, branch, existing issue |
| Gather | 5 in parallel | `gather.md`, one reader each | one dossier per reader |
| Decide | draft, critic, revise | `decide.md` | issue number, outline with marks |
| Build | prep, one per block, seed, review loop, render, push | `build.md`, one section each | typecheck, seed, issues, push |
| Hand off | 1 | `handoff.md` | card, lists, summary |

A failure in build comments on the card and leaves it in Building, so Ovi
sees the state on the tracker. Claim failures return without writing.

Every build stage returns `forOvi` lines (`decision:`, `review:`, `client:`,
`assumption:`). The script collects them and hand off writes them on the
card as the **For Ovi** comment, with the spec's decisions and client
questions. That comment is the list of what a human still has to settle.

## Models

The `MODEL` table at the top of the script sets model and effort per stage.
Mechanical stages (claim, gather, prep, render check, push, hand off, abort)
run on a smaller model. Copy, block design, and judgement (decide, critic,
blocks, seed, review, fixes) inherit the session model. Change the table,
not the prompts, to tune cost.

## What lives here and what does not

This folder holds only what exists for this workflow: the script and its
stage instructions. Shared references stay where they are and are cited in
place: `docs/agents/page-workflow.md` (repo facts, also used by
`page-integrate`), `docs/agents/page-builder.md`, `frontend/DESIGN.md`,
`docs/avatars.md`, `CONTEXT.md`, `frontend/PRODUCT.md`.

## Principles every stage keeps

- The old page is a starting point, never a template. Existing blocks never
  decide what a page says. Blog posts are out of scope; they migrate as-is.
- Decide, do not ask. A decision with more than one defensible answer goes in
  the spec's "Decisions made without Ovi" with the option taken and why. A
  fact the site cannot supply is a client question, never an invention.
- Repository facts live in `docs/agents/page-workflow.md`: Basecamp ids,
  the claim protocol, the shared-state rules, scripts, the render check, the
  handoff checklist. Read the part your stage needs.
- Write drafts only. Touch only this page's documents. Never publish.

## Flow

```mermaid
flowchart TD
  start(["Start: name a page"]) --> claim
  subgraph P1["1. Take the page"]
    claim["Find the page's Basecamp card"] --> claimed{Is someone else
already working on it?}
    claimed -- yes --> stop(["Stop. Touch nothing."])
    claimed -- no --> mark["Mark the card as in progress
with this branch name"] --> hasplan{Has the plan for this page
already been written?}
  end
  subgraph P2["2. Research (5 agents at once)"]
    gA["Who the page is for
and the writing rules"]
    gB["What the old page says"]
    gC["Related blog posts and
the pages next to it in the menu"]
    gD["Which page sections exist
and the design rules"]
    gE["Which photos exist"]
  end
  hasplan -- no --> gA & gB & gC & gD & gE
  subgraph P3["3. Plan"]
    decide["Write the plan for the page
as a GitHub issue, link it on the card"] --> critic["A second agent reads the plan
as the parent it is written for"] --> critq{Found problems?}
    critq -- yes --> revise["Fix the plan"]
    readplan["Read the existing plan"]
  end
  hasplan -- yes --> readplan
  gA & gB & gC & gD & gE -- notes --> decide
  subgraph P4["4. Build"]
    prep["Get the latest code,
check nobody else is editing the same sections,
back up the content database"] --> prepq{All good?}
    prepq -- yes --> blocks["Build each new or redesigned
page section, one at a time"]
    blocks --> seed["Write the page text and
save it as a draft in Sanity"]
    seed --> checker["Proofread the page:
voice, banned words, unconfirmed facts,
colours alternate, buttons in place"] --> revq{Found problems?
Up to 3 rounds}
    revq -- yes --> fixer["Fix them and save again"] --> checker
    revq -- no --> render["Load the page on the dev server
and check every section shows up"] --> renderq{Page loads?}
    renderq -- no --> renderfix["Fix it, one try"] --> render
    renderq -- yes --> push["Final checks, then push the code"]
  end
  critq -- no --> prep
  revise --> prep
  readplan --> prep
  prepq -- no --> abort
  blocks -. code will not compile .-> abort
  seed -. draft will not save .-> abort
  push -. push fails .-> abort
  abort["Give up: write what went wrong
on the card, leave it marked in progress"]
  subgraph P5["5. Hand over to Ovi"]
    handoff["Move the card to Ovi Polish
Write on the card: what to look at, what was guessed,
what to ask the camp
Make the to-do list of things the camp must supply"]
  end
  push --> handoff --> done(["Draft ready for Ovi"])
  style P1 fill:#f1f3f5,stroke:#868e96
  style P2 fill:#e7f0fb,stroke:#2c88d9
  style P3 fill:#f3e8fb,stroke:#9c36b5
  style P4 fill:#fff1e6,stroke:#e8833a
  style P5 fill:#e6f7f2,stroke:#207868
  style abort fill:#d3455b,stroke:#a02a3c,color:#fff
  style start fill:#788896,stroke:#4b5c6b,color:#fff
  style done fill:#207868,stroke:#14513f,color:#fff
```

Rendered copies: `flow.svg`, `flow.png`, and `flow.excalidraw` (open it at
excalidraw.com or with the VS Code Excalidraw extension). Regenerate after
editing the Mermaid:

```bash
node .claude/workflows/page-draft/render-flow.mjs    # svg + png
node .claude/workflows/page-draft/to-excalidraw.mjs  # .excalidraw
```

Both use Playwright's Chromium and fetch Mermaid and Excalidraw from CDNs.
