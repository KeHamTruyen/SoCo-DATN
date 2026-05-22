import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import { orderApi } from "../../order/api/orderApi";
import { profileApi } from "../../profile/api/profileApi";
import type { PublicUserProfile } from "../../profile/types/profile.types";
import type { Order } from "../../order/types/order.types";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";

export interface FeedSidebarData {
    orders: Order[];
    products: ProductListItem[];
    suggestedUsers: PublicUserProfile[];
}

let inflight: Promise<FeedSidebarData> | null = null;
let cached: FeedSidebarData | null = null;
let cachedAt = 0;
const TTL_MS = 30_000;

export function loadFeedSidebarData(): Promise<FeedSidebarData> {
    const now = Date.now();
    if (cached && now - cachedAt < TTL_MS) {
        return Promise.resolve(cached);
    }
    if (!inflight) {
        inflight = Promise.all([
            orderApi.listOrders({ status: "shipping", pageSize: 3 }).catch(() => ({ items: [] })),
            marketplaceApi.listProducts({ pageSize: 4 }).catch(() => ({ items: [] })),
            profileApi.listSuggestedUsers().catch(() => []),
        ]).then(([ordersRes, productsRes, users]) => {
            const data: FeedSidebarData = {
                orders: ordersRes?.items ?? [],
                products: productsRes?.items ?? [],
                suggestedUsers: users ?? [],
            };
            cached = data;
            cachedAt = Date.now();
            return data;
        }).finally(() => {
            inflight = null;
        });
    }
    return inflight;
}

export function invalidateFeedSidebarDataCache() {
    cached = null;
    cachedAt = 0;
    inflight = null;
}
