import { httpClient } from "../../../shared/api/httpClient";
import type { ProductDetail, ProductVariantRow } from "../types/product.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

function num(v: unknown, fallback = 0): number {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
}

function mapOptionsLabel(options: unknown, variantName: string): string {
    if (options && typeof options === "object" && !Array.isArray(options)) {
        const o = options as Record<string, unknown>;
        const parts = Object.entries(o)
            .map(([k, val]) => `${k}: ${String(val)}`)
            .filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
    }
    return variantName;
}

function mapVariantRow(v: Record<string, unknown>): ProductVariantRow {
    const variantName = String(v.variantName ?? "");
    const options = v.options;
    const value = mapOptionsLabel(options, variantName);
    return {
        id: String(v.id),
        name: variantName,
        value,
        price: v.price === null || v.price === undefined ? null : num(v.price),
        stockQuantity: num(v.stockQuantity, 0),
        isActive: v.isActive !== false,
    };
}

export function mapApiProductToDetail(raw: Record<string, unknown>): ProductDetail {
    const imgs = (raw.images as { imageUrl?: string }[] | undefined) ?? [];
    const variantsRaw = (raw.variants as Record<string, unknown>[] | undefined) ?? [];
    const variants = variantsRaw
        .filter((x) => x.isActive !== false)
        .map(mapVariantRow);

    const basePrice = num(raw.price);
    const compare = raw.compareAtPrice;
    const oldPrice =
        compare === null || compare === undefined ? undefined : num(compare);

    return {
        id: String(raw.id ?? ""),
        name: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        price: basePrice,
        oldPrice: oldPrice && oldPrice > basePrice ? oldPrice : undefined,
        images: imgs.map((i) => i.imageUrl).filter(Boolean) as string[],
        rating: undefined,
        seller: raw.seller
            ? {
                  id: String((raw.seller as { id?: string }).id ?? ""),
                  name: String(
                      (raw.seller as { fullName?: string; username?: string })
                          .fullName ||
                          (raw.seller as { username?: string }).username ||
                          "",
                  ),
                  avatarUrl: (raw.seller as { avatarUrl?: string }).avatarUrl,
              }
            : undefined,
        variants: variants.length > 0 ? variants : undefined,
    };
}

export const productApi = {
    async getProductDetail(productId: string) {
        const res = await httpClient.get<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
            `/products/${productId}`,
            { requiresAuth: false },
        );
        const data = unwrap(res);
        return mapApiProductToDetail(data as Record<string, unknown>);
    },
};
