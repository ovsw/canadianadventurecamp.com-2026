# Build flow policy

This file applies when `/to-spec`, `/to-tickets`, `/implement`, or `/tdd`
runs in this repo. The rules here replace the closing steps and test steps
written inside those skills. The skills are shared across projects; this file
is where this project decides.

## Architectural flag

`/to-spec` and `/to-tickets` must mark every ticket, and every item in the
spec's Implementation Decisions, with one line:

`Architectural: yes|no — <reason>`

The answer is **yes** when any of these is true:

- It changes a stored shape: a Sanity schema, a Page Builder section's fields,
  or the shape a GROQ query returns.
- It adds, moves, or removes a seam that other code calls through.
- It adds a term to `CONTEXT.md`, or changes what an existing term means.
- It adds a dependency, or is the first instance of a pattern others will copy.
- If the implementer chose differently, other tickets would have to change.

When **yes**: the decision is made in the spec, and in an ADR if it is hard to
reverse. The ticket points at the decision; it does not make it.

During `/implement`: if the ticket needs an architectural choice that the spec
does not make, stop and ask. Do not pick.

## Test policy

Test logic, not looks.

- Write tests only for: destructive data work; security or authorization; pure
  logic that is hard to verify by eye (resolvers, transforms, GROQ shaping,
  migration scripts); a regression that is expensive to reproduce.
- Do not test layout, spacing, colour, copy, or that a component renders. Ovi
  verifies looks in the browser.
- The spec's Testing Decisions section names what is tested. Follow it. If the
  spec has no such section, apply the list above.
- `/tdd` drives only the tested slices. Build untested slices directly.

## Closing steps for `/implement`

The skill's own text says: run the full test suite, run `/code-review`, commit.
In this repo:

- Run the typecheck and the single test files you touched. Do not run
  `pnpm verify` or the full suite.
- Do not run `/code-review` or the `coderabbit` CLI. Review is a separate step
  that Ovi triggers. See [Review policy](#review-policy).
- Commit on the current branch. Then report: what changed, what was checked,
  and any open questions.

## PR architecture

One PR per ticket. Each ticket is a tracer bullet: it lands green on `main` by
itself. That is what lets the next `/implement` session start from `main` and
see the blocker's work, and what keeps each diff small enough to review in one
sitting.

- Branch from `main` for each ticket. Do not stack branches.
- The PR body says `Closes #<ticket>` and `Part of #<spec>`. The spec issue
  closes when its last ticket merges.
- Exception: tickets that cannot stay green alone (the wide-refactor case in
  `/to-tickets`) share one integration branch and one PR, gated by the final
  integrate-and-verify ticket.

## Review policy

Ovi triggers every CodeRabbit review. One review per ticket, never two, and no
second review after the fixes. Route by the ticket's risk:

| Ticket | CLI review (before the PR, same session) | PR review |
| --- | --- | --- |
| `Architectural: yes`, or touches data, auth, or migrations | no | yes, once |
| Logic, not architectural | yes | no |
| Looks, copy, or content only | no | no |

Architectural tickets use the PR quota: CodeRabbit sees the merged codebase
and the GitHub thread is a record worth keeping. Other logic uses the CLI
quota, so fixes land in the session that wrote the code. Looks-only tickets
get Ovi's eyes; that is the only review that works for them.

Sequence in the implementing session: `/implement` → commit → CLI review if
the table says so → fix → `/theo-file-pr` → PR review if the table says so →
`/autofix` → merge.
