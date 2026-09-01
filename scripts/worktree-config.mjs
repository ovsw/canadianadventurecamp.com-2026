import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

export const HOST = "127.0.0.1";
export const SLOT_COUNT = 10;
export const FRONTEND_BASE_PORT = 3000;
export const STUDIO_BASE_PORT = 3333;
export const RUNTIME_FILE = ".worktree-ports.json";
const STATE_VERSION = 1;

export function portsForSlot(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) {
    throw new Error(`Port slot must be between 0 and ${SLOT_COUNT - 1}.`);
  }

  return {
    version: STATE_VERSION,
    slot,
    frontendPort: FRONTEND_BASE_PORT + slot,
    studioPort: STUDIO_BASE_PORT + slot,
  };
}

export function firstSlotForPath(worktreeRoot) {
  const digest = createHash("sha256").update(path.resolve(worktreeRoot)).digest();
  return digest.readUInt32BE(0) % SLOT_COUNT;
}

function parsePort(value, label) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} must be an integer.`);
  }
  return Number(value);
}

export function validateOverrides(overrides = {}) {
  const hasFrontend = overrides.frontendPort !== undefined;
  const hasStudio = overrides.studioPort !== undefined;
  if (!hasFrontend && !hasStudio) return undefined;
  if (!hasFrontend || !hasStudio) {
    throw new Error("Provide both --frontend-port and --studio-port together.");
  }

  const frontendPort = parsePort(overrides.frontendPort, "Frontend port");
  const studioPort = parsePort(overrides.studioPort, "Studio port");
  if (frontendPort === studioPort) throw new Error("Frontend and Studio ports must differ.");

  const frontendSlot = frontendPort - FRONTEND_BASE_PORT;
  const studioSlot = studioPort - STUDIO_BASE_PORT;
  if (
    frontendSlot < 0 ||
    frontendSlot >= SLOT_COUNT ||
    studioSlot < 0 ||
    studioSlot >= SLOT_COUNT
  ) {
    throw new Error(
      `Overrides must stay inside the Sanity CORS pool: frontend ${FRONTEND_BASE_PORT}-${FRONTEND_BASE_PORT + SLOT_COUNT - 1}, Studio ${STUDIO_BASE_PORT}-${STUDIO_BASE_PORT + SLOT_COUNT - 1}.`,
    );
  }
  if (frontendSlot !== studioSlot) {
    throw new Error("Frontend and Studio overrides must use the same port slot.");
  }

  return portsForSlot(frontendSlot);
}

function normalizeSavedState(value) {
  if (!value || typeof value !== "object") return undefined;
  const frontendPort = Number(value.frontendPort);
  const studioPort = Number(value.studioPort);
  const frontendSlot = frontendPort - FRONTEND_BASE_PORT;
  const studioSlot = studioPort - STUDIO_BASE_PORT;
  if (
    !Number.isInteger(frontendPort) ||
    !Number.isInteger(studioPort) ||
    frontendSlot !== studioSlot ||
    frontendSlot < 0 ||
    frontendSlot >= SLOT_COUNT
  ) {
    return undefined;
  }

  const normalized = portsForSlot(frontendSlot);
  return {
    state: normalized,
    migrated:
      value.version !== STATE_VERSION ||
      value.slot !== normalized.slot ||
      value.frontendPort !== normalized.frontendPort ||
      value.studioPort !== normalized.studioPort,
  };
}

async function readSavedState(runtimeFile) {
  try {
    const parsed = JSON.parse(await readFile(runtimeFile, "utf8"));
    const saved = normalizeSavedState(parsed);
    if (!saved) {
      throw new Error(
        `Saved port state in ${runtimeFile} does not match the current pool; remove it and try again.`,
      );
    }
    return saved;
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${runtimeFile}; remove it and try again.`, {
        cause: error,
      });
    }
    throw error;
  }
}

async function saveState(runtimeFile, state) {
  const temporaryFile = `${runtimeFile}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryFile, runtimeFile);
  } finally {
    await rm(temporaryFile, { force: true });
  }
}

export async function isPortAvailable(port, host = HOST) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") resolve(false);
      else reject(error);
    });
    server.listen({ host, port, exclusive: true }, () => {
      server.close((error) => (error ? reject(error) : resolve(true)));
    });
  });
}

async function stateIsAvailable(state, probe) {
  const [frontendAvailable, studioAvailable] = await Promise.all([
    probe(state.frontendPort),
    probe(state.studioPort),
  ]);
  return frontendAvailable && studioAvailable;
}

export async function allocatePorts({
  worktreeRoot,
  runtimeFile = path.join(worktreeRoot, RUNTIME_FILE),
  overrides,
  probe = isPortAvailable,
}) {
  const overrideState = validateOverrides(overrides);
  if (overrideState) {
    if (!(await stateIsAvailable(overrideState, probe))) {
      throw new Error(
        `Requested slot ${overrideState.slot} is busy (${overrideState.frontendPort}/${overrideState.studioPort}).`,
      );
    }
    await saveState(runtimeFile, overrideState);
    return overrideState;
  }

  const saved = await readSavedState(runtimeFile);
  if (saved) {
    if (!(await stateIsAvailable(saved.state, probe))) {
      throw new Error(
        `Saved slot ${saved.state.slot} is busy (${saved.state.frontendPort}/${saved.state.studioPort}). It may already be running for this worktree.`,
      );
    }
    if (saved.migrated) await saveState(runtimeFile, saved.state);
    return saved.state;
  }

  const firstSlot = firstSlotForPath(worktreeRoot);
  for (let offset = 0; offset < SLOT_COUNT; offset += 1) {
    const state = portsForSlot((firstSlot + offset) % SLOT_COUNT);
    if (await stateIsAvailable(state, probe)) {
      await saveState(runtimeFile, state);
      return state;
    }
  }

  throw new Error(`All ${SLOT_COUNT} worktree port slots are busy.`);
}

export function desiredSanityOrigins() {
  return Array.from({ length: SLOT_COUNT }, (_, slot) => portsForSlot(slot)).flatMap(
    ({ frontendPort, studioPort }) => [
      { origin: `http://localhost:${frontendPort}`, credentials: true },
      { origin: `http://localhost:${studioPort}`, credentials: true },
    ],
  );
}
