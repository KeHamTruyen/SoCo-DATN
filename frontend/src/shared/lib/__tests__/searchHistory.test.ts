import { describe, expect, it } from "vitest";
import { filterSearchHistory } from "../searchHistory";

describe("filterSearchHistory", () => {
    it("returns all items when query is empty", () => {
        const items = ["laptop", "phone"];
        expect(filterSearchHistory(items, "")).toEqual(items);
        expect(filterSearchHistory(items, "   ")).toEqual(items);
    });

    it("filters items case-insensitively", () => {
        expect(filterSearchHistory(["Laptop", "Phone", "Laptop bag"], "lap")).toEqual([
            "Laptop",
            "Laptop bag",
        ]);
    });
});
