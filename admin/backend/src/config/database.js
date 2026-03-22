import { PrismaClient } from "@prisma/client";

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
