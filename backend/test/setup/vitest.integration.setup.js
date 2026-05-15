import "dotenv/config";
import { afterAll, beforeAll } from "vitest";
import {
    closeRequestApp,
    startRequestAppServer,
} from "../helpers/appRequest.js";

process.env.NODE_ENV = "test";

// CI / local runs may omit backend/.env; auth integration needs a signing secret.
if (!process.env.JWT_SECRET?.trim()) {
    process.env.JWT_SECRET =
        "integration-test-jwt-secret-min-32-chars-long!!";
}

beforeAll(async () => {
    await startRequestAppServer();
});

afterAll(async () => {
    await closeRequestApp();
});
