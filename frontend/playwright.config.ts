import { execFileSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

// Another checkout's server may already hold 3000, so a local run takes a free
// port. Playwright reloads this config in every worker, so pick the port once
// in the main process and hand it to the workers through the environment.
if (!process.env.PLAYWRIGHT_PORT) {
  process.env.PLAYWRIGHT_PORT = process.env.CI
    ? "3000"
    : execFileSync(
        process.execPath,
        [
          "-e",
          "const s=require('node:net').createServer().listen(0,()=>{process.stdout.write(String(s.address().port));s.close()})",
        ],
        { encoding: "utf8" },
      );
}
const port = Number(process.env.PLAYWRIGHT_PORT);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // The route walk in e2e/cac.spec.ts is sharded into parallel tests. The
  // public-repo runner has four cores; use them all instead of the default half.
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_REUSE_BUILD
      ? "pnpm start"
      : "pnpm build && pnpm start",
    env: { PORT: String(port) },
    url: baseURL,
    reuseExistingServer:
      !process.env.CI && !process.env.PLAYWRIGHT_REUSE_BUILD,
    timeout: 180_000,
  },
});
