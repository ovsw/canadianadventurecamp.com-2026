import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  allocatePorts,
  desiredSanityOrigins,
  firstSlotForPath,
  FRONTEND_BASE_PORT,
  portsForSlot,
  SLOT_COUNT,
  STUDIO_BASE_PORT,
  validateOverrides,
} from "./worktree-config.mjs";

async function temporaryWorktree() {
  return mkdtemp(path.join(tmpdir(), "cac-worktree-test-"));
}

test("the same worktree gets the same bounded first slot", () => {
  const root = "/work/example/t3code-stable";
  assert.equal(firstSlotForPath(root), firstSlotForPath(root));
  for (let slot = 0; slot < SLOT_COUNT; slot += 1) {
    const ports = portsForSlot(slot);
    assert.equal(ports.frontendPort, FRONTEND_BASE_PORT + slot);
    assert.equal(ports.studioPort, STUDIO_BASE_PORT + slot);
  }
});

test("an occupied first slot falls forward inside the pool", async () => {
  const worktreeRoot = await temporaryWorktree();
  const first = firstSlotForPath(worktreeRoot);
  const blocked = portsForSlot(first);
  const selected = await allocatePorts({
    worktreeRoot,
    probe: async (port) => port !== blocked.frontendPort && port !== blocked.studioPort,
  });
  assert.equal(selected.slot, (first + 1) % SLOT_COUNT);
});

test("a selection persists and is reused", async () => {
  const worktreeRoot = await temporaryWorktree();
  const first = await allocatePorts({ worktreeRoot, probe: async () => true });
  const second = await allocatePorts({ worktreeRoot, probe: async () => true });
  assert.deepEqual(second, first);
});

test("legacy saved ports migrate to the current state shape", async () => {
  const worktreeRoot = await temporaryWorktree();
  const runtimeFile = path.join(worktreeRoot, ".worktree-ports.json");
  await writeFile(runtimeFile, JSON.stringify({ frontendPort: 3004, studioPort: 3337 }));
  const selected = await allocatePorts({ worktreeRoot, runtimeFile, probe: async () => true });
  assert.deepEqual(selected, portsForSlot(4));
  assert.deepEqual(JSON.parse(await readFile(runtimeFile, "utf8")), portsForSlot(4));
});

test("saved ports from a different pool are clearly rejected", async () => {
  const worktreeRoot = await temporaryWorktree();
  await writeFile(
    path.join(worktreeRoot, ".worktree-ports.json"),
    JSON.stringify({ version: 0, frontendPort: 4100, studioPort: 5100 }),
  );
  await assert.rejects(
    allocatePorts({ worktreeRoot, probe: async () => true }),
    /does not match the current pool/,
  );
});

test("an occupied saved selection stops instead of launching a duplicate", async () => {
  const worktreeRoot = await temporaryWorktree();
  await writeFile(
    path.join(worktreeRoot, ".worktree-ports.json"),
    JSON.stringify(portsForSlot(2)),
  );
  await assert.rejects(
    allocatePorts({ worktreeRoot, probe: async () => false }),
    /may already be running/,
  );
});

test("manual overrides must be complete, paired, and allowlisted", () => {
  assert.throws(() => validateOverrides({ frontendPort: "3001" }), /both/);
  assert.throws(
    () => validateOverrides({ frontendPort: "3010", studioPort: "3343" }),
    /CORS pool/,
  );
  assert.throws(
    () => validateOverrides({ frontendPort: "3001", studioPort: "3335" }),
    /same port slot/,
  );
  assert.deepEqual(
    validateOverrides({ frontendPort: "3001", studioPort: "3334" }),
    portsForSlot(1),
  );
});

test("Sanity origins exactly cover both services with the right credentials", () => {
  const origins = desiredSanityOrigins();
  assert.equal(origins.length, SLOT_COUNT * 2);
  assert.equal(new Set(origins.map(({ origin }) => origin)).size, SLOT_COUNT * 2);
  for (let slot = 0; slot < SLOT_COUNT; slot += 1) {
    assert.deepEqual(origins[slot * 2], {
      origin: `http://localhost:${FRONTEND_BASE_PORT + slot}`,
      credentials: true,
    });
    assert.deepEqual(origins[slot * 2 + 1], {
      origin: `http://localhost:${STUDIO_BASE_PORT + slot}`,
      credentials: true,
    });
  }
});
