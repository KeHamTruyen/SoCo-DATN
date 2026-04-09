import { describe, expect, it } from "vitest";
import { parseRatingFilter, parseSort } from "../marketplaceFilters";

describe("marketplaceFilters", () => {
    describe("parseSort", () => {
        it("returns valid sort values", () => {
            expect(parseSort("relevance")).toBe("relevance");
            expect(parseSort("popular")).toBe("popular");
            expect(parseSort("newest")).toBe("newest");
            expect(parseSort("price_asc")).toBe("price_asc");
            expect(parseSort("price_desc")).toBe("price_desc");
        });

        it("falls back to relevance for invalid or empty values", () => {
            expect(parseSort(null)).toBe("relevance");
            expect(parseSort("")).toBe("relevance");
            expect(parseSort("unknown")).toBe("relevance");
        });
    });

    describe("parseRatingFilter", () => {
        it("returns valid rating filters", () => {
            expect(parseRatingFilter("1_plus")).toBe("1_plus");
            expect(parseRatingFilter("2_plus")).toBe("2_plus");
            expect(parseRatingFilter("3_plus")).toBe("3_plus");
            expect(parseRatingFilter("4_plus")).toBe("4_plus");
            expect(parseRatingFilter("5_only")).toBe("5_only");
        });

        it("returns undefined for invalid rating filters", () => {
            expect(parseRatingFilter(null)).toBeUndefined();
            expect(parseRatingFilter("")).toBeUndefined();
            expect(parseRatingFilter("5_plus")).toBeUndefined();
        });
    });
});

