import "dotenv/config";
import { afterAll, beforeAll } from "vitest";

process.env.NODE_ENV = "test";

// ES optional in integration; unset before app load so search/catalog use DB fallback.
delete process.env.ELASTICSEARCH_URL;
delete process.env.ELASTICSEARCH_CLOUD_ID;
delete process.env.ELASTICSEARCH_API_KEY;

if (!process.env.JWT_SECRET?.trim()) {
    process.env.JWT_SECRET =
        "integration-test-jwt-secret-min-32-chars-long!!";
}

/** @type {typeof import("../helpers/appRequest.js")} */
let appRequestModule;
/** @type {typeof import("../../src/lib/redis.js")} */
let redisModule;

beforeAll(async () => {
    appRequestModule = await import("../helpers/appRequest.js");
    await appRequestModule.startRequestAppServer();
});

afterAll(async () => {
    redisModule = await import("../../src/lib/redis.js");
    await redisModule.closeRedisClient().catch(() => {});
    if (appRequestModule) {
        await appRequestModule.closeRequestApp();
    }
});
