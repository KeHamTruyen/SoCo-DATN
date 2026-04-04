import type { SellerProductDimensions } from "../types/sellerDashboard.types";

export function parseOptionalNonNegNumber(s: string): number | undefined {
    const t = s.trim();
    if (t === "") return undefined;
    const n = Number.parseFloat(t.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseOptionalFieldNumber(
    s: string,
): { ok: true; value: number | null } | { ok: false } {
    const t = s.trim();
    if (t === "") return { ok: true, value: null };
    const n = Number.parseFloat(t.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return { ok: false };
    return { ok: true, value: n };
}

export function buildDimensions(
    lengthStr: string,
    widthStr: string,
    heightStr: string,
): SellerProductDimensions | null {
    const length = parseOptionalNonNegNumber(lengthStr);
    const width = parseOptionalNonNegNumber(widthStr);
    const height = parseOptionalNonNegNumber(heightStr);
    if (length === undefined && width === undefined && height === undefined) return null;
    const o: SellerProductDimensions = { unit: "cm" };
    if (length !== undefined) o.length = length;
    if (width !== undefined) o.width = width;
    if (height !== undefined) o.height = height;
    return o;
}

export function dimensionInputsValid(lengthStr: string, widthStr: string, heightStr: string): boolean {
    for (const s of [lengthStr, widthStr, heightStr]) {
        const t = s.trim();
        if (t === "") continue;
        if (parseOptionalNonNegNumber(s) === undefined) return false;
    }
    return true;
}

export function parseCommaKeywords(s: string): string[] {
    return s
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 50);
}

export function parseOptionsJson(s: string): Record<string, string> {
    const t = s.trim();
    if (!t) return {};
    try {
        const o = JSON.parse(t) as unknown;
        if (typeof o === "object" && o !== null && !Array.isArray(o)) {
            return Object.fromEntries(
                Object.entries(o as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]),
            );
        }
    } catch {
        /* ignore */
    }
    return {};
}

export type DraftVariantRow = {
    id: string;
    name: string;
    sku: string;
    price: string;
    stock: string;
    optionsJson: string;
};

export function newDraftVariant(): DraftVariantRow {
    return {
        id: `draft-${Math.random().toString(36).slice(2)}`,
        name: "",
        sku: "",
        price: "",
        stock: "0",
        optionsJson: "{}",
    };
}

export type SellerProductFormFields = {
    title: string;
    description: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    categoryId: string;
    stockQuantity: string;
    lowStockThreshold: string;
    trackInventory: boolean;
    sku: string;
    weight: string;
    dimLength: string;
    dimWidth: string;
    dimHeight: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    status: string;
};

export function emptyForm(): SellerProductFormFields {
    return {
        title: "",
        description: "",
        price: "",
        compareAtPrice: "",
        costPrice: "",
        categoryId: "",
        stockQuantity: "0",
        lowStockThreshold: "10",
        trackInventory: true,
        sku: "",
        weight: "",
        dimLength: "",
        dimWidth: "",
        dimHeight: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        status: "DRAFT",
    };
}

export function parsePrice(s: string): number | undefined {
    const t = s.trim();
    if (t === "") return undefined;
    const n = Number.parseFloat(t.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseIntSafe(s: string, fallback: number): number {
    const n = Number.parseInt(s, 10);
    return Number.isNaN(n) || n < 0 ? fallback : n;
}
