import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        setupFiles: ["./test/setup/vitest.setup.js"],
        include: ["test/unit/**/*.test.js", "test/http/**/*.test.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
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
