import { cpSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const adminBackendRoot = join(__dirname, "..");
const repoRoot = join(adminBackendRoot, "..", "..");
const corePrisma = join(repoRoot, "backend", "node_modules", ".prisma");
const adminPrisma = join(adminBackendRoot, "node_modules", ".prisma");

if (!existsSync(join(corePrisma, "client"))) {
    console.error(
        "Missing generated Prisma client under backend. Run: cd backend && npx prisma generate",
    );
    process.exit(1);
}

mkdirSync(dirname(adminPrisma), { recursive: true });
cpSync(corePrisma, adminPrisma, { recursive: true });
console.log("Synced backend/node_modules/.prisma -> admin/backend/node_modules/.prisma");
