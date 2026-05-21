import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        setupFiles: ["./test/setup/vitest.integration.setup.js"],
        include: ["test/integration/**/*.integration.test.js"],
        fileParallelism: false,
        pool: "forks",
        testTimeout: 30_000,
        hookTimeout: 30_000,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./coverage-integration",
            include: ["src/**/*.js"],
            exclude: [
                "node_modules/**",
                "test/**",
                "**/*.test.js",
                "**/*.integration.test.js",
            ],
        },
    },
});
