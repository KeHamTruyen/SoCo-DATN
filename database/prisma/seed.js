import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
dotenv.config({ path: path.join(__dirname, "..", "..", "backend", ".env") });

const backendClientPath = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "node_modules",
    "@prisma",
    "client",
);
const { PrismaClient } = require(backendClientPath);
const bcrypt = (await import("bcryptjs")).default;

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;
    const username = process.env.SEED_ADMIN_USERNAME?.trim();
    const fullName =
        process.env.SEED_ADMIN_FULL_NAME?.trim() || "Administrator";

    if (!email || !password || !username) {
        throw new Error(
            "Seed requires SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_USERNAME in backend/.env (see backend/.env.example).",
        );
    }

    const userConflict = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (userConflict) {
        throw new Error(
            `Cannot seed admin: ${email} or ${username} is already used by a buyer/seller account.`,
        );
    }

    const existingAdmin = await prisma.admin.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (existingAdmin) {
        console.log("Admin account already exists — skipping create.");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({
        data: {
            email,
            username,
            passwordHash,
            fullName,
            isActive: true,
        },
    });
    console.log(`Seeded platform admin: ${email} (${username})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
