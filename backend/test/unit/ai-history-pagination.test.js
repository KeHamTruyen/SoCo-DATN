import { describe, it, expect } from "vitest";
import { parseHistoryListQuery } from "../../src/services/ai.service.js";

describe("parseHistoryListQuery", () => {
    it("applies defaults", () => {
        const q = parseHistoryListQuery({});
        expect(q.page).toBe(1);
        expect(q.limit).toBe(20);
        expect(q.skip).toBe(0);
        expect(q.filter).toBe("all");
        expect(q.sortOrder).toBe("desc");
    });

    it("clamps limit to 50", () => {
        const q = parseHistoryListQuery({ page: "1", limit: "999" });
        expect(q.limit).toBe(50);
    });

    it("computes skip", () => {
        const q = parseHistoryListQuery({ page: "3", limit: "10" });
        expect(q.page).toBe(3);
        expect(q.limit).toBe(10);
        expect(q.skip).toBe(20);
    });

    it("handles filter and sort", () => {
        const draft = parseHistoryListQuery({ filter: "draft", sort: "asc" });
        expect(draft.filter).toBe("draft");
        expect(draft.sortOrder).toBe("asc");
        const bad = parseHistoryListQuery({ filter: "nope" });
        expect(bad.filter).toBe("all");
    });
});
