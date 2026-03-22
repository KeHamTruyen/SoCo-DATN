import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Monorepo: use core backend's generated client (includes `Admin` and full schema).
// Local `admin/backend/node_modules/.prisma` is easy to miss — run `npm run prisma:generate` there to sync.
const repoRoot = path.join(__dirname, "..", "..", "..", "..");
const corePrismaClientPath = path.join(
    repoRoot,
    "backend",
    "node_modules",
    "@prisma",
    "client",
);

const { PrismaClient } = existsSync(path.join(corePrismaClientPath, "index.js"))
    ? require(corePrismaClientPath)
    : require("@prisma/client");

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
