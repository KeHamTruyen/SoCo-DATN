/** Shown separately in Shop branding; omit from text profile list. */
const BRANDING_URL_KEYS = new Set(["shopLogoUrl", "shopCoverUrl"]);

export function shopInfoEntries(
    shop: Record<string, unknown> | null | undefined,
): [string, string][] {
    if (!shop || typeof shop !== "object") return [];
    const labels: Record<string, string> = {
        shopName: "Shop name",
        shopCategory: "Category",
        shopDescription: "Description",
        shopAddress: "Address",
        contactPhone: "Contact phone",
        idType: "ID type",
    };
    return Object.entries(shop)
        .filter(([k]) => !BRANDING_URL_KEYS.has(k))
        .map(([k, v]) => [labels[k] ?? k, v == null ? "" : String(v)]);
}
