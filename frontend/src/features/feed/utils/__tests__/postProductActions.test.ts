import { describe, expect, it } from "vitest";
import { getUniqueTaggedProducts } from "../postProductActions";
import type { FeedPost } from "../../types/feed.types";

const basePost: FeedPost = {
    id: "post-1",
    content: "",
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    author: { id: "u1", email: "a@b.c" },
};

describe("getUniqueTaggedProducts", () => {
    it("returns one entry per productId", () => {
        const products = getUniqueTaggedProducts({
            ...basePost,
            taggedProducts: [
                {
                    id: "t1",
                    productId: "prod-1",
                    productName: "One",
                    price: 10,
                    positionX: 50,
                    positionY: 50,
                    sortOrder: 1,
                },
                {
                    id: "t2",
                    productId: "prod-2",
                    productName: "Two",
                    price: 20,
                    positionX: 60,
                    positionY: 60,
                    sortOrder: 0,
                },
                {
                    id: "t3",
                    productId: "prod-1",
                    productName: "One duplicate",
                    price: 10,
                    positionX: 40,
                    positionY: 40,
                    sortOrder: 2,
                },
            ],
        });

        expect(products).toHaveLength(2);
        expect(products.map((p) => p.productId)).toEqual(["prod-2", "prod-1"]);
        expect(products[1].productName).toBe("One");
    });
});
