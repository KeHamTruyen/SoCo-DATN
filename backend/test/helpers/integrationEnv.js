import { describe } from "vitest";
import { bearerAuth } from "./authHeaders.js";
import { ensureIntegrationBuyer } from "./integrationFixtures.js";

/** True when DATABASE_URL is set (integration tests may run against a real DB). */
export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

/**
 * Use instead of top-level `describe` so suites skip when no DATABASE_URL is configured.
 */
export const integrationDescribe = hasDatabaseUrl ? describe : describe.skip;

/**
 * Logs in as the integration buyer (upserted via Prisma when needed) and returns bearer headers.
 * @param {import('supertest').SuperTest<import('supertest').Test>} agent
 */
export async function loginAsQaBuyer(agent) {
    const { email, password } = await ensureIntegrationBuyer();
    const res = await agent
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({ email, password });

    if (res.status !== 200) {
        throw new Error(
            `QA buyer login failed (${res.status}): ${JSON.stringify(res.body)}`,
        );
    }

    const accessToken = res.body?.data?.accessToken;
    if (!accessToken) {
        throw new Error("Login response missing data.accessToken");
    }

    return {
        token: accessToken,
        user: res.body?.data?.user,
        bearerHeaders: bearerAuth(accessToken),
    };
}
