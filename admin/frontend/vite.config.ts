import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.join(__dirname, "src"),
            "@admin-shared": path.join(__dirname, "../shared"),
            // Shared lives outside frontend root; pin dep to this package's install.
            "@casl/ability": path.join(
                __dirname,
                "node_modules/@casl/ability",
            ),
        },
    },
});
