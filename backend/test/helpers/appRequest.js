import request from "supertest";
import app from "../../src/app.js";

/**
 * Supertest agent bound to the Express app (no listen()).
 * @returns {import('supertest').SuperTest<import('supertest').Test>}
 */
export function requestApp() {
    return request(app);
}

export { app };
