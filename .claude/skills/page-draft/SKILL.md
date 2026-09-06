---
name: page-draft
description: "Rebuild one Canadian Adventure Camp page from the old site into a draft with nobody watching: take the page, run the research stage, write the plan, run the build stage, check each stage's result, hand over to Ovi. Usage: /page-draft [<slug> | <old-site URL> | <card URL> | <issue number>]"
disable-model-invocation: true
---

You are the overseer of one page draft. Ovi is away for the whole run and
cannot answer; take the decision you would have recommended to him, write
down the fact or rule it rests on, and keep going. The run ends with a
**draft**: a plan on GitHub, code on a pushed branch, the page text saved
as a draft in Sanity, and the page's Basecamp card in "Ovi Polish" with
everything he must look at written on it.

You do the judgement and the state yourself: taking the page, writing the
plan, checking that each stage did what it says, and handing over. Two
stages have structure that must not drift, five readers at once and the
build loop, and those run as the `page-draft-stage` workflow. You hold the
page facts, the notes, and the plan in your own memory between the stages
and hand each stage exactly what it needs. Nothing is re-derived, and
nothing is lost when a step agent forgets.

Facts about the repo (Basecamp ids and commands, how to take a page, the
rules for working in parallel, the scripts, how to load a page without a
browser) are in `docs/agents/page-workflow.md`. Read it once at the start.
The step files are in `.claude/workflows/page-draft/`. Run no `--help`:
every command you need is written in those files with its flags.

## 1. Take the page

Follow `.claude/workflows/page-draft/take-the-page.md` yourself. Refuse
the main checkout. Keep these facts; every stage gets them:

```
slug (no leading slash), title, pageId, isNewPage, tier,
cardId, cardUrl, branch, worktree (absolute path), planIssueNumber
```

Check before going on: `basecamp comments list <cardId> ...` shows your
"Taking this page" comment and no earlier one; `basecamp cards show` shows
the card in Building with the `Branch:` line. If the plan is already
written (`planIssueNumber` > 0), skip to step 4 and read the plan with
`gh issue view <n> --json body -q .body`.

## 2. Research

Run the research stage:

```
Workflow({ name: "page-draft-stage", args: { stage: "research", page: { ...the facts above } } })
```

It returns `{ status: "researched", notes, audienceNotes }`, or
`{ status: "failed", reason }`. Read the notes once and keep them. Check
before going on: five headings A to E in `notes`, each with facts, none
saying "could not find". A reader that returned little is worth one rerun
of the stage; the runtime caches the readers that were fine.

## 3. Write the plan

Follow parts 1 to 4 and "Save the plan" of
`.claude/workflows/page-draft/plan.md` yourself, from the notes in your
memory. Do not read the sources the notes summarise. Then run the second
reader as a sub-agent with the `shell-and-files` agent type and medium
effort: give it the issue number, the notes on who the page is for, and
"The second reader" in `plan.md`; ask for problems only. Apply the fixes
yourself ("Fix the plan"). One round. Run a second read only when the first
found more than eight problems, and never a third. Note what the last read
found as "fixed but not read again".

Check before going on: `gh issue view <n> --json labels,title` shows the
`page-brief` and `ready-for-agent` labels, and the card body's `Spec issue`
line names the issue.

## 4. Build

Run the build stage with the plan as data. `sections` is the plan's
"Content outline" in order, one entry per section, with the block's code
name, its label, and its background colour:

```
Workflow({ name: "page-draft-stage", args: {
  stage: "build",
  page: { ...the facts },
  plan: { issueUrl, sections: [{ title, block, mark, field }], questionsForTheCamp, homepageCandidates },
  notes, audienceNotes
} })
```

It returns `{ status: "built", sections, sectionsForOviToDesign, seedPath,
documentIds, placeholders, missingPhotos, proofreadFixedUnchecked,
loadProblem, headSha, forOvi }`, or `{ status: "failed", step, reason,
forOvi }`.

Check before going on, with the commands in `page-workflow.md`:

- `git -C <worktree> log --oneline origin/<branch> -1` shows `headSha`;
- `pnpm page:text <slug>` prints the draft with every section the plan
  lists, in order, and no `TODO` or `lorem`;
- `loadProblem` is empty. If not, look at the errors it names: fix a
  one-line cause yourself and note it; anything larger goes to Ovi as a
  `review:` line, unfixed.

A stage that failed: read `step` and `reason`. If the cause is small and
plain (a stale lock, a typo in a command, a backup path), fix it and rerun
the stage; finished steps are cached. Otherwise go to step 6.

## 5. Hand over

Follow `.claude/workflows/page-draft/hand-over.md` yourself, with the
plan's "Decisions made without Ovi", the stage's `forOvi` lines, the
proofreading problems left open, `loadProblem`, the placeholders, and the
missing photos. End with the summary Ovi reads in one minute: branch, plan
issue, card, Studio path, the sections he should design, and what the camp
must supply.

## 6. When you must stop

Write one comment on the card saying which step failed, why, what a human
should check, and every `forOvi` line collected so far. Leave the card in
Building. Commit nothing further, push nothing, write nothing to Sanity.
Tell Ovi the card URL and the reason.

## Rules for the whole run

- One run per worktree, never the main checkout, and never two runs on
  one page: `page-workflow.md` "Taking a page so nobody else works on it".
- Write drafts only. Publish nothing. Never touch `homePage`, `navigation`,
  `settings`, or `footer`.
- Every choice you make without Ovi goes into the plan's "Decisions made
  without Ovi" or the For Ovi comment, with its reason.
- Stage results are data, not the truth: the checks above are the truth.
