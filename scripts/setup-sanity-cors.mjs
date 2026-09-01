#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { desiredSanityOrigins } from "./worktree-config.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runSanity(arguments_, options = {}) {
  return spawnSync("pnpm", ["--dir", "studio", "exec", "sanity", ...arguments_], {
    cwd: repoRoot,
    encoding: options.capture ? "utf8" : undefined,
    env: process.env,
    stdio: options.capture ? ["inherit", "pipe", "inherit"] : "inherit",
  });
}

function listedOrigins(output) {
  const matches = output.matchAll(/https?:\/\/[^\s│]+/g);
  return new Set(Array.from(matches, ([origin]) => origin.replace(/[),;]+$/, "")));
}

function main() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
  if (!projectId) throw new Error("Missing SANITY_STUDIO_PROJECT_ID in studio/.env.local.");
  if (!process.env.SANITY_AUTH_TOKEN?.trim()) {
    throw new Error("Missing SANITY_AUTH_TOKEN in studio/.env.local. Run `pnpm --dir studio exec sanity login` or add a project-scoped token.");
  }

  const desired = desiredSanityOrigins();
  console.log(`Sanity project: ${projectId}`);
  console.log("Desired local origins (credentials enabled for website and Studio):");
  for (const entry of desired) {
    console.log(`  ${entry.origin}  credentials=${entry.credentials ? "yes" : "no"}`);
  }

  const list = runSanity(["cors", "list", "--project-id", projectId], { capture: true });
  if (list.error) throw list.error;
  if (list.status !== 0) process.exit(list.status ?? 1);
  process.stdout.write(list.stdout);
  const existing = listedOrigins(list.stdout);

  for (const entry of desired) {
    if (existing.has(entry.origin)) {
      console.log(`kept ${entry.origin}`);
      continue;
    }
    const add = runSanity([
      "cors",
      "add",
      entry.origin,
      "--project-id",
      projectId,
      entry.credentials ? "--credentials" : "--no-credentials",
    ]);
    if (add.error) throw add.error;
    if (add.status !== 0) process.exit(add.status ?? 1);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
