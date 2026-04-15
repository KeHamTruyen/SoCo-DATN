import productService from "./product.service.js";
import userService from "./user.service.js";
import * as postService from "./post.service.js";

function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const searchAll = async ({
    query,
    page = 1,
    limit = 6,
    types = ["products", "users", "posts"],
    userId = null,
}) => {
    const q = String(query ?? "").trim();
    if (!q) {
        return {
            products: { items: [], total: 0, page, limit },
            users: { items: [], total: 0, page, limit },
            posts: { items: [], total: 0, page, limit },
        };
    }

    const safePage = toPositiveInt(page, 1);
    const safeLimit = Math.min(toPositiveInt(limit, 6), 20);
    const requested = new Set(types);

    const tasks = [];
    if (requested.has("products")) {
        tasks.push(
            productService
                .getProducts({
                    page: safePage,
                    limit: safeLimit,
                    search: q,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                })
                .then((result) => ({
                    key: "products",
                    value: {
                        items: result.products ?? [],
                        total: result.pagination?.total ?? 0,
                        page: safePage,
                        limit: safeLimit,
                    },
                })),
        );
    }
    if (requested.has("users")) {
        tasks.push(
            userService.searchUsers(q, { page: safePage, limit: safeLimit }).then((result) => ({
                key: "users",
                value: {
                    items: result.users ?? [],
                    total: result.pagination?.total ?? 0,
                    page: safePage,
                    limit: safeLimit,
                },
            })),
        );
    }
    if (requested.has("posts")) {
        tasks.push(
            postService
                .getPosts({
                    page: safePage,
                    limit: safeLimit,
                    search: q,
                    userId,
                })
                .then((result) => ({
                    key: "posts",
                    value: {
                        items: result.posts ?? [],
                        total: result.pagination?.total ?? 0,
                        page: safePage,
                        limit: safeLimit,
                    },
                })),
        );
    }

    const resolved = await Promise.all(tasks);
    const base = {
        products: { items: [], total: 0, page: safePage, limit: safeLimit },
        users: { items: [], total: 0, page: safePage, limit: safeLimit },
        posts: { items: [], total: 0, page: safePage, limit: safeLimit },
    };
    for (const entry of resolved) {
        base[entry.key] = entry.value;
    }
    return base;
};
