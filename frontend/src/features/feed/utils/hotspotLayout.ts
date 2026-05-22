import type { ShoppableProduct } from "../types/feed.types";

const MIN_DISTANCE = 14;

/** Nudge overlapping MEDIA_HOTSPOT markers so multiple tags stay readable. */
export function layoutMediaHotspots(tags: ShoppableProduct[]): ShoppableProduct[] {
    if (tags.length <= 1) return tags;

    const laidOut = tags.map((tag) => ({ ...tag }));
    for (let i = 1; i < laidOut.length; i++) {
        for (let j = 0; j < i; j++) {
            const dx = laidOut[i].positionX - laidOut[j].positionX;
            const dy = laidOut[i].positionY - laidOut[j].positionY;
            if (Math.hypot(dx, dy) >= MIN_DISTANCE) continue;

            const angle = ((i - j) * 72 + i * 37) * (Math.PI / 180);
            laidOut[i] = {
                ...laidOut[i],
                positionX: clampPercent(laidOut[j].positionX + Math.cos(angle) * MIN_DISTANCE),
                positionY: clampPercent(laidOut[j].positionY + Math.sin(angle) * MIN_DISTANCE),
            };
        }
    }
    return laidOut;
}

function clampPercent(value: number) {
    return Math.min(92, Math.max(8, value));
}
