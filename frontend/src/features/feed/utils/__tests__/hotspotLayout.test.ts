import { describe, expect, it } from "vitest";
import { layoutMediaHotspots } from "../hotspotLayout";

describe("layoutMediaHotspots", () => {
    it("separates markers that share the same coordinates", () => {
        const [first, second] = layoutMediaHotspots([
            {
                id: "a",
                productId: "p1",
                productName: "A",
                price: 1,
                positionX: 50,
                positionY: 50,
            },
            {
                id: "b",
                productId: "p2",
                productName: "B",
                price: 2,
                positionX: 50,
                positionY: 50,
            },
        ]);

        expect(first.positionX).toBe(50);
        expect(first.positionY).toBe(50);
        const distance = Math.hypot(second.positionX - first.positionX, second.positionY - first.positionY);
        expect(distance).toBeGreaterThan(10);
        expect(second.positionX !== first.positionX || second.positionY !== first.positionY).toBe(true);
    });
});
