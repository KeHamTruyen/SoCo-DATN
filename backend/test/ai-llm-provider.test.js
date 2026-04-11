import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

test("getLlmClient throws when no Gemini key and text backup disabled", () => {
    const snippet = `
import { getLlmClient, resetLlmClientCache } from './src/services/ai/text/llmClient.js';
delete process.env.GEMINI_API_KEY;
process.env.AI_TEXT_BACKUP_PROVIDER = 'none';
resetLlmClientCache();
getLlmClient();
`;
    const r = spawnSync(
        process.execPath,
        ["--input-type=module", "--eval", snippet],
        {
            cwd: backendRoot,
            encoding: "utf8",
        },
    );
    assert.notEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(
        (r.stderr || "") + (r.stdout || ""),
        /Configure GEMINI_API_KEY|GEMINI_API_KEY/i,
        r.stdout + r.stderr,
    );
});

test("getLlmClient throws when AI_TEXT_BACKUP_PROVIDER is invalid", () => {
    const snippet = `
import { getLlmClient, resetLlmClientCache } from './src/services/ai/text/llmClient.js';
process.env.GEMINI_API_KEY = 'dummy-key-for-init';
process.env.AI_TEXT_BACKUP_PROVIDER = 'not-a-valid-backup';
resetLlmClientCache();
getLlmClient();
`;
    const r = spawnSync(
        process.execPath,
        ["--input-type=module", "--eval", snippet],
        {
            cwd: backendRoot,
            encoding: "utf8",
        },
    );
    assert.notEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(
        (r.stderr || "") + (r.stdout || ""),
        /Unknown AI_TEXT_BACKUP_PROVIDER/i,
        r.stdout + r.stderr,
    );
});
