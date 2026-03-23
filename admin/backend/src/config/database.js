import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Schema: database/prisma. Client is generated into backend/node_modules only (no copy into admin).
const repoRoot = path.join(__dirname, "..", "..", "..", "..");
const corePrismaClientPath = path.join(
    repoRoot,
    "backend",
    "node_modules",
    "@prisma",
    "client",
);

if (!existsSync(path.join(corePrismaClientPath, "index.js"))) {
    throw new Error(
        "Admin API: Prisma client missing under backend/node_modules. From repo root run: cd database && npm install && npm run generate (backend must have npm install first).",
    );
}

const { PrismaClient } = require(corePrismaClientPath);

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

prisma.$connect().catch((error) => {
    console.error("Admin API: database connection failed:", error);
    process.exit(1);
});

process.on("beforeExit", async () => {
    await prisma.$disconnect();
});

export default prisma;
