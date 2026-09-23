import assert from "node:assert/strict";
import test from "node:test";
import { isDocsOnly } from "./gate-scope.mjs";

test("documentation-only changes skip the code gate", () => {
  assert.equal(
    isDocsOnly([
      "docs/agents/build-flow.md",
      "docs/plans/2026-09-18-next-work-plan.md",
      "README.md",
      "CLAUDE.md",
      ".claude/skills/page-draft/SKILL.md",
      ".claude/hooks/copy-local-env.sh",
      ".codex/notes.md",
    ]),
    true,
  );
});

test("any code, config, lockfile, or workflow change runs the code gate", () => {
  for (const file of [
    "frontend/app/page.tsx",
    "studio/schema.json",
    "package.json",
    "pnpm-lock.yaml",
    ".github/workflows/release-gate.yml",
    ".github/dependabot.yml",
    "scripts/gate-scope.mjs",
    "docs/../frontend/lib/x.ts",
    "frontend/README.md.bak",
  ]) {
    assert.equal(isDocsOnly(["README.md", file]), false, file);
  }
});

test("an empty or blank file list runs the code gate", () => {
  assert.equal(isDocsOnly([]), false);
  assert.equal(isDocsOnly(["", "  ", "\n"]), false);
});
