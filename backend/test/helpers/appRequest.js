import request from "supertest";
import http from "node:http";
import app from "../../src/app.js";

let testServer;
let testServerUrl;

export function startRequestAppServer() {
    if (testServerUrl) {
        return Promise.resolve(testServerUrl);
    }

    return new Promise((resolve, reject) => {
        testServer = http.createServer(app);
        testServer.once("error", reject);
        testServer.listen(0, "127.0.0.1", () => {
            const address = testServer.address();
            if (!address || typeof address === "string") {
                reject(new Error("Test server is not listening on a TCP port"));
                return;
            }

            testServerUrl = `http://127.0.0.1:${address.port}`;
            resolve(testServerUrl);
        });
    });
}

/**
 * Supertest agent bound to a local loopback server.
 * @returns {import('supertest').SuperTest<import('supertest').Test>}
 */
export function requestApp() {
    if (!testServerUrl) {
        throw new Error("Test server has not been started");
    }

    return request(testServerUrl);
}

export function closeRequestApp() {
    return new Promise((resolve, reject) => {
        if (!testServer) {
            resolve();
            return;
        }

        testServer.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            testServer = undefined;
            testServerUrl = undefined;
            resolve();
        });
    });
}

export { app };
