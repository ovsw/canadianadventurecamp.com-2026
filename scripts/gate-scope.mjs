#!/usr/bin/env node

// Decides whether a pull request needs the code half of the release gate.
//
// The GitHub workflow pipes the pull request's changed file names into this
// script. When every file is documentation, the heavy jobs (typegen, types,
// lint, tests, builds, smoke) are skipped and the "Release gate" check passes
// on its own. Anything else, including an empty list, runs the full gate.

import { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCUMENTATION_PATTERNS = [
  /^docs\//,
  /\.md$/,
  /^\.claude\//,
  /^\.codex\//,
];

export function isDocsOnly(files) {
  const names = files.map((file) => file.trim()).filter(Boolean);
  if (names.length === 0) return false;
  return names.every(
    (name) =>
      !name.split("/").includes("..") &&
      DOCUMENTATION_PATTERNS.some((pattern) => pattern.test(name)),
  );
}

async function readStandardInput() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const files = (await readStandardInput()).split("\n");
  const names = files.map((file) => file.trim()).filter(Boolean);
  const code = !isDocsOnly(names);

  if (names.length === 0) {
    console.log("No changed files were listed; running the code gate.");
  } else if (code) {
    console.log(`${names.length} changed file(s) include code; running the code gate.`);
  } else {
    console.log(`${names.length} changed file(s) are documentation only; skipping the code gate.`);
  }

  const output = `code=${code}\n`;
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, output);
  } else {
    process.stdout.write(output);
  }
}
