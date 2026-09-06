# Page-draft operator

The main agent is the operator. Subagents provide bounded work products. The
operator owns every transition and every write to Basecamp, GitHub, Sanity, and
the remote Git branch.

## Start or resume

1. Confirm this is a non-main worktree and note its branch.
2. Initialize or load the run state:

   ```bash
   node .agents/skills/page-draft/scripts/run-state.mjs init --target "<target>"
   ```

3. Keep the returned `statePath`. Use it for every later state command.
4. If the state says `failed`, inspect its failure and resume it only when the
   cause is resolved:

   ```bash
   node .agents/skills/page-draft/scripts/run-state.mjs resume --state <statePath>
   ```

5. Read `docs/agents/page-workflow.md` sections "Taking a page so nobody else
   works on it" and "Rules for working in parallel" before any shared write.

The target can be a slug, old-site URL, Basecamp card URL, GitHub plan issue
number, or empty for the next unclaimed card. Omit `--stop-after` when the user
does not set it. Otherwise add `--stop-after <value>`; valid values are
`take-the-page`, `research`, and `plan`.

## Checkpoints

Record a checkpoint only after its completion criterion is true:

```bash
node .agents/skills/page-draft/scripts/run-state.mjs checkpoint \
  --state <statePath> --stage <stage> --data-file <jsonFile>
```

The stages are:

```text
initialized -> claimed -> researched -> planned -> prepared -> blocks-built
-> draft-written -> verified -> pushed -> handed-off
```

An existing plan may take `claimed -> planned`. A checkpoint at the current
stage is an idempotent metadata update. Put large notes in the run's `artifacts`
directory and store their paths in checkpoint data.

Record each item for Ovi when it becomes known:

```bash
node .agents/skills/page-draft/scripts/run-state.mjs note \
  --state <statePath> --category <decision|review|client|assumption> \
  --source "<step>" --text "<one traceable fact>"
```

## Phase 1: claim

Read `.claude/workflows/page-draft/take-the-page.md`. The operator performs the
whole step. A subagent must not claim a card.

Checkpoint `claimed` only when this run wrote the first claim comment, the card
is in Building, and its body names this branch. Store the resolved page, card,
branch, tier, and existing plan issue. Stop without other writes when another
run owns the page or this is the main checkout.

## Phase 2: research

Read `.claude/workflows/page-draft/research.md`. Use three explorer subagents so
the operator plus workers fit a four-thread session:

1. **Audience** owns research heading A.
2. **Content** owns headings B and C.
3. **Product** owns headings D and E.

Run them in parallel. Give each agent the page identity, its exact headings,
the shared research instructions, and one distinct output file under the run's
`artifacts` directory. Each explorer is read-only except for that output file.
It returns the file path and a short summary. It does not edit code, GitHub,
Basecamp, or Sanity.

The operator checks that the three files cover headings A through E, that cited
facts retain their source, and that unknown facts are identified. Checkpoint
`researched` with the three artifact paths. The files, not raw agent logs, are
the inputs to later phases.

## Phase 3: plan

Read `.claude/workflows/page-draft/plan.md`.

If the claim found an existing open plan issue, read it and checkpoint `planned`
with its issue number, URL, and section list. Do not repeat research unless the
issue lacks information required to build.

For a new plan:

1. Give one worker the three research artifacts and ownership of
   `artifacts/plan.md`. It writes the complete proposed issue body and changes
   no external system.
2. Give one explorer the proposed plan, the audience artifact, and the "second
   reader" rules. It writes problems only to `artifacts/plan-review.json`.
3. Send material problems back to the plan worker once. A second review is
   warranted only when the first review found more than eight material
   problems. Record final-round fixes as unchecked notes for Ovi.
4. The operator creates or updates the GitHub issue, then adds its link to the
   Basecamp card.

Checkpoint `planned` only after the issue and card link exist. Store the issue,
ordered section list, homepage candidates, client questions, decisions, and
artifact paths.

## Phase 4: build

Read `.claude/workflows/page-draft/build.md`. The operator performs "Get ready":
sync from main, scan block locks, name the Sanity project and dataset, create
the required timestamped export, and verify it with `gzip -t`. Checkpoint
`prepared` with the backup path only after every check passes.

Build each distinct `new`, `design`, or `extend` block sequentially. Spawn a
fresh worker with ownership of that block's schema, query, renderer, and required
registration files. Tell it that other agents share the worktree and it must
preserve their changes. The operator checks its focused type and generated-code
results before starting the next block. The worker may commit its block but may
not push. Checkpoint `blocks-built` after every required block is complete; use
an empty list when all blocks are reused.

Give one worker the research artifacts, plan, and ownership of the page seed
file. It writes and dry-runs the seed, but the operator performs `--apply` after
checking the target document ids and backup path. The operator validates the
affected draft and checkpoints `draft-written` with the seed path, document ids,
placeholders, and missing photos.

Give one explorer the rendered page text, plan, audience artifact, and the
"Proofread" rules. It returns problems only. Give fixes to a worker that owns
the seed and any named code files. The operator reapplies changed seed content.
Use the same bounded review rule as the plan. Record final-round fixes as
unchecked notes for Ovi.

The operator performs "Load the page and check it" without a browser, as the
shared instructions require. A load failure becomes a `review` note and does
not prevent the final push. Checkpoint `verified` with the load result and the
focused checks that ran.

The operator performs the final sync, checks, commit if needed, and push.
Checkpoint `pushed` with the head SHA only after the remote branch contains it.

## Phase 5: handoff

Read `.claude/workflows/page-draft/hand-over.md`. The operator performs the
handoff so one writer controls every tracker field and issue:

- Create or reuse the page's client-input list. Avoid duplicate lists and
  to-dos when resuming.
- Update the card fields and move it to Ovi Polish.
- Add the handoff and consolidated **For Ovi** comments.
- Comment on the plan issue.
- Create only missing homepage-coherence issues.
- Use `.worktree-ports.json` to return the direct URL
  `http://localhost:<studioPort>/presentation?preview=/<slug>`.

Run the finish checklist in `docs/agents/page-workflow.md`. Checkpoint
`handed-off` with every URL and the final summary only when all required items
are present.

## Failure and recovery

After a page is claimed, every controlled failure must be recorded locally:

```bash
node .agents/skills/page-draft/scripts/run-state.mjs fail \
  --state <statePath> --step "<step>" --reason "<actionable reason>"
```

Then add one Basecamp card comment with the failed step, cause, recovery action,
and collected notes for Ovi. Leave the card in Building. Do not push partial
work or make further Sanity writes while handling the failure.

A terminated ChatGPT session cannot run cleanup code. On the next run, load the
manifest and inspect the card before resuming. The manifest supplies the last
completed checkpoint; Basecamp, GitHub, Git, and Sanity remain the authoritative
external state.
