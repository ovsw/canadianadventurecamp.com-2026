<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `frontend/node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Dev Server rules

Before starting a development server, inspect the required port. If the exact server you need is already running there, reuse it.

## Sanity browser checks (Codex)

In Codex, always use the ChatGPT in-app browser for local or remote Sanity
checks. Never use the Next.js loop browser to open or inspect Sanity Studio or
any Sanity URL.

## Shell discipline and reporting observations

The Bash tool's working directory **persists between calls**. A `cd` in one
command silently changes what every later relative path resolves to. This has
already produced confidently-wrong claims about missing files.

- Run every command from a known cwd: use absolute paths, or `cd` to the repo
  root first. Never rely on inherited shell state.
- Do not use `2>/dev/null` on any command whose output feeds a conclusion. A
  suppressed error and an empty result look identical and mean different things.
- Do not chain independent checks with `&&` — the first failure hides every
  check after it. Use `;` or separate calls.
- **Never report a file as missing, deleted, or changed on the strength of one
  failed check.** Re-verify from an absolute path first.
- Report what was observed, not what was inferred: "the check returned nothing"
  is a different claim from "the file does not exist." Never attribute a change
  to the user's actions without direct evidence.
- When a new result contradicts an earlier observation in the same session,
  stop and re-verify. The newer result is not automatically the correct one.

This matters most before destructive or delegated work: unverified claims about
environment state (which dataset is configured, which env file is loaded) are
exactly what makes handing off write access dangerous.

## Sanity dataset writes

Ovi gives standing permission for Sanity dataset mutations required by the
current task.

- This permission includes creating draft content, inserting Page Builder
  sections, and migrating affected documents into changed schema shapes.
- Sanity-backed work is complete only when required content exists in the
  dataset in the shape the code expects. Use supplied or reference content;
  when none exists, write practical draft content and identify it in the
  handoff. Do not leave content entry or reshaping to Ovi.
- For feature work, write to drafts. When a migration must update existing
  stored shapes, preserve each document's draft or published state. Never
  publish a draft unless Ovi asks.
- Before the first write, name the project and dataset, create a timestamped
  backup, and verify the archive with `gzip -t`. If backup or verification
  fails, stop before writing.
- For document-only work, use
  `sanity datasets export <dataset> <backup>.tar.gz --raw`. This avoids
  downloading asset files while preserving their references for same-dataset
  restoration.
- If the work changes asset documents or references, or uploads, replaces, or
  deletes assets, create a full export including assets instead.
- Dataset deletion, project settings, access controls, and unrelated cleanup
  still require explicit approval.

## Fast verification

Ovi is the primary tester. Finish the implementation, then give him the exact
URL, viewport, state, and actions to check. Use his report as the visual verdict.
Use a browser or screenshots only when he explicitly asks.

During implementation, run only the smallest cheap check needed to catch a
syntax, type, or generated-code failure. Do not add tests merely because code
changed, and do not run broad test suites by default.

Add or run focused tests only when Ovi asks, or when the change involves:

- destructive data work;
- security or authorization;
- subtle pure logic that is hard to verify manually; or
- a regression that is expensive to reproduce.

`pnpm verify` is a release and pull-request gate. Run it only when Ovi asks for
that gate, not during implementation.

## Review agents

Review agents are explicit opt-in. Do not invoke review subagents, review
skills, CodeRabbit, or an adversarial review loop unless Ovi requests that
review in the current task.

## Repository scanning

Use `rg` or `git ls-files` for discovery. Exclude `.claude/worktrees/`,
`node_modules/`, `.next/`, `.sanity/`, `dist/`, `build/`, and `backups/` from
broad scans. If `find` is necessary, prune those paths explicitly.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `build`, `ci`.
- Scope is optional but preferred when the change is confined to one area — e.g. `feat(header):`, `fix(studio):`.
- Summary is imperative and lowercase: "add", not "added" or "Adds".
- Keep explaining *why* in the body. The prefix classifies the change; it does not replace the reasoning.
- Note that commits predating this rule use plain imperative subjects with no prefix. Follow the convention above, not the older style.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain-doc layout. See `docs/agents/domain.md`.

### Page rethink

Inner pages are rethought, not migrated. `/page-draft <slug>` is a dynamic
workflow (`.claude/workflows/page-draft.js`, step instructions in
`.claude/workflows/page-draft/`) that takes a page from the old site to a
draft with nobody watching (take the page, research, write the plan, build,
hand over to Ovi), and the `/page-integrate` skill merges the finished
branches into one PR. Several drafts run in parallel worktrees, so read
"Taking a page so nobody else works on it" and "Rules for working in
parallel" in `docs/agents/page-workflow.md` before touching a page, a
section, or the content database. Avatars live in `docs/avatars.md`.

### Page Builder work

Before adding or changing a Page Builder section, its fields, or its stored
content shape, read `docs/agents/page-builder.md`.

### Sanity CLI

Always pass `SANITY_AUTH_TOKEN` from `studio/.env.local` when invoking the Sanity CLI. See `docs/agents/sanity-cli.md`.

### Development workflow

Before changing workspace dependencies, Sanity schemas, GROQ queries, or development scripts, consult the relevant section of `README.md`.
