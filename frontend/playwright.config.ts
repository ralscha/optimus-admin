import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:18080",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "go run ./cmd/server",
    cwd: "../backend",
    env: {
      OPTIMUS_ADMIN_ADDRESS: "127.0.0.1:18080",
      OPTIMUS_ADMIN_WEB_ROOT: "../frontend/dist/optimus-admin/browser",
    },
    url: "http://localhost:18080/api/health",
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
