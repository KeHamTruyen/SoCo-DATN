import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    // Single worker: one Vite dev server cannot reliably serve many parallel browser sessions.
    fullyParallel: false,
    workers: 1,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: "http://127.0.0.1:3000",
        navigationTimeout: 60_000,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "off",
    },
    projects: [
        {
            name: "edge",
            use: { ...devices["Desktop Edge"], channel: "msedge" },
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        // Reuse a running Vite server on :3000 when the developer already has the app open.
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
