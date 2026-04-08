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

export function normalizeKeywordList(list: string[]): string[] {
    return list
        .map((k) => k.trim())
        .filter(Boolean)
        .filter((k, idx, arr) => arr.findIndex((x) => x.toLowerCase() === k.toLowerCase()) === idx)
        .slice(0, 50);
}

export type DraftVariantRow = {
    id: string;
    optionMap: Record<string, string>;
    price: string;
    stock: string;
    isActive: boolean;
};

export type VariantGroup = {
    id: string;
    name: string;
    values: string[];
};

export type VariantLoadMode = "missing-only" | "regenerate-all";

export function variantOptionMapKey(optionMap: Record<string, string>): string {
    const parts = Object.entries(optionMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`);
    return parts.join("|||");
}

export function variantOptionMapDisplay(optionMap: Record<string, string>): string {
    return Object.values(optionMap).join(" / ");
}

export function normalizeVariantGroup(group: VariantGroup): VariantGroup {
    const name = group.name.trim();
    const values = group.values
        .map((v) => v.trim())
        .filter(Boolean)
        .filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
    return { ...group, name, values };
}

export function normalizeVariantGroups(groups: VariantGroup[]): VariantGroup[] {
    return groups.map(normalizeVariantGroup).filter((g) => g.name.length > 0);
}

export function hasDuplicateVariantGroupNames(groups: VariantGroup[]): boolean {
    return groups.some((g, idx, arr) => arr.findIndex((x) => x.name.toLowerCase() === g.name.toLowerCase()) !== idx);
}

function buildOptionCombinations(groups: VariantGroup[]): Record<string, string>[] {
    const normalized = normalizeVariantGroups(groups).filter((g) => g.values.length > 0);
    if (normalized.length === 0) return [];

    let acc: Record<string, string>[] = [{}];
    for (const group of normalized) {
        const next: Record<string, string>[] = [];
        for (const prev of acc) {
            for (const value of group.values) {
                next.push({ ...prev, [group.name]: value });
            }
        }
        acc = next;
    }
    return acc;
}

export function buildVariantMatrixRowsDynamic(
    groups: VariantGroup[],
    previousRows: DraftVariantRow[],
    mode: VariantLoadMode,
): DraftVariantRow[] {
    const combinations = buildOptionCombinations(groups);
    if (combinations.length === 0) return [];

    const previousMap = new Map(previousRows.map((row) => [variantOptionMapKey(row.optionMap), row]));
    const rows: DraftVariantRow[] = [];

    for (const optionMap of combinations) {
        const key = variantOptionMapKey(optionMap);
        const prev = mode === "missing-only" ? previousMap.get(key) : undefined;
        rows.push(
            prev ?? {
                id: `draft-${Math.random().toString(36).slice(2)}`,
                optionMap,
                price: "",
                stock: "0",
                isActive: true,
            },
        );
    }

    return rows;
}

type VariantLike = {
    id: string;
    price?: number | null;
    stockQuantity?: number | null;
    isActive?: boolean;
    options?: Record<string, unknown> | null;
};

export function variantGroupsFromRows(rows: VariantLike[]): VariantGroup[] {
    const groupMap = new Map<string, Set<string>>();
    for (const variant of rows) {
        for (const [name, value] of Object.entries(variant.options ?? {})) {
            if (!groupMap.has(name)) groupMap.set(name, new Set());
            groupMap.get(name)?.add(String(value));
        }
    }
    return Array.from(groupMap.entries()).map(([name, values], idx) => ({
        id: `group-${idx}-${name}`,
        name,
        values: Array.from(values),
    }));
}

export function draftRowsFromVariants(rows: VariantLike[]): DraftVariantRow[] {
    return rows.map((v) => ({
        id: v.id,
        optionMap: Object.fromEntries(Object.entries(v.options ?? {}).map(([k, val]) => [k, String(val)])),
        price: v.price != null ? String(v.price) : "",
        stock: String(v.stockQuantity ?? 0),
        isActive: v.isActive !== false,
    }));
}

export type SellerProductFormFields = {
    title: string;
    description: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    categoryIds: string[];
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
    metaKeywords: string[];
    status: string;
};

export function emptyForm(): SellerProductFormFields {
    return {
        title: "",
        description: "",
        price: "",
        compareAtPrice: "",
        costPrice: "",
        categoryIds: [],
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
        metaKeywords: [],
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
