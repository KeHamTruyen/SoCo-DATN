import test from "node:test";
import assert from "node:assert/strict";
import { parseHistoryListQuery } from "../src/services/ai.service.js";

test("parseHistoryListQuery defaults", () => {
    const q = parseHistoryListQuery({});
    assert.equal(q.page, 1);
    assert.equal(q.limit, 20);
    assert.equal(q.skip, 0);
    assert.equal(q.filter, "all");
    assert.equal(q.sortOrder, "desc");
});

test("parseHistoryListQuery clamps limit to 50", () => {
    const q = parseHistoryListQuery({ page: "1", limit: "999" });
    assert.equal(q.limit, 50);
});

test("parseHistoryListQuery computes skip", () => {
    const q = parseHistoryListQuery({ page: "3", limit: "10" });
    assert.equal(q.page, 3);
    assert.equal(q.limit, 10);
    assert.equal(q.skip, 20);
});

test("parseHistoryListQuery filter and sort", () => {
    const draft = parseHistoryListQuery({ filter: "draft", sort: "asc" });
    assert.equal(draft.filter, "draft");
    assert.equal(draft.sortOrder, "asc");
    const bad = parseHistoryListQuery({ filter: "nope" });
    assert.equal(bad.filter, "all");
});
