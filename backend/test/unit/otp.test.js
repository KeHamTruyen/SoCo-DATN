import { describe, it, expect } from "vitest";
import { generateOtp, generateSecureToken } from "../../src/utils/otp.js";

describe("otp utils", () => {
    it("generateOtp returns fixed-width numeric string", () => {
        const code = generateOtp(6);
        expect(code).toMatch(/^\d{6}$/);
        expect(generateOtp(4)).toMatch(/^\d{4}$/);
    });

    it("generateSecureToken returns 64 hex chars", () => {
        const t = generateSecureToken();
        expect(t).toHaveLength(64);
        expect(t).toMatch(/^[0-9a-f]+$/);
    });
});
