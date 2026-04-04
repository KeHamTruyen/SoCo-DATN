import { format, setHours, setMinutes, setSeconds } from "date-fns";
import type { PostMediaType, PostVisibility } from "../types/feed.types";

export function toDatetimeLocalValue(date: Date | undefined, timeStr: string): string {
    if (!date) return "";
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] ?? "", 10);
    const m = parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return "";
    const d = setSeconds(setMinutes(setHours(date, h), m), 0);
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function mediaTypeFromFile(file: File): PostMediaType {
    if (file.type.startsWith("video/")) return "VIDEO";
    return "IMAGE";
}

export function parsePostVisibility(v: unknown): PostVisibility {
    if (v === "PUBLIC" || v === "FOLLOWERS" || v === "FOLLOWING" || v === "PRIVATE") return v;
    return "PUBLIC";
}
