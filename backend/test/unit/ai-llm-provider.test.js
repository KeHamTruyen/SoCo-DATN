import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "../..");

describe("llmClient env", () => {
    it("getLlmClient throws when no Gemini key and text backup disabled", () => {
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
        expect(r.status, r.stdout + r.stderr).not.toBe(0);
        expect((r.stderr || "") + (r.stdout || "")).toMatch(
            /Configure GEMINI_API_KEY|GEMINI_API_KEY/i,
        );
    });

    it("getLlmClient throws when AI_TEXT_BACKUP_PROVIDER is invalid", () => {
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
        expect(r.status, r.stdout + r.stderr).not.toBe(0);
        expect((r.stderr || "") + (r.stdout || "")).toMatch(
            /Unknown AI_TEXT_BACKUP_PROVIDER/i,
        );
    });
});
