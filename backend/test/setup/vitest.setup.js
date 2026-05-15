process.env.NODE_ENV = "test";
process.env.SKIP_DB_CONNECT = "true";

import { afterAll, beforeAll } from "vitest";
import {
    closeRequestApp,
    startRequestAppServer,
} from "../helpers/appRequest.js";

beforeAll(async () => {
    await startRequestAppServer();
});

afterAll(async () => {
    await closeRequestApp();
});
