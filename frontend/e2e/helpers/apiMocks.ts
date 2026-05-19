import type { Page, Route } from "@playwright/test";

const API_PATTERN = "http://localhost:5000/api/**";

const buyerUser = {
    id: "user-buyer-1",
    email: "buyer@soco.test",
    username: "buyer",
    fullName: "Buyer Test",
    role: "BUYER",
    isVerified: true,
    isActive: true,
    avatarUrl: null,
};

function json(route: Route, body: unknown, status = 200) {
    return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
    });
}

function product(id: string, title: string, price: string, keywords: string[] = []) {
    return {
        id,
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        price,
        images: [],
        seller: { fullName: "SoCo Seller", username: "seller" },
        categories: [{ id: "cat-phone", name: "Điện thoại" }],
        metaKeywords: keywords,
        salesCount: 12,
    };
}

export async function mockGuestApi(page: Page) {
    await page.route(API_PATTERN, async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname.replace("/api", "");
        const method = route.request().method();

        if (method === "POST" && path === "/auth/login") {
            return json(route, {
                success: true,
                data: {
                    requires2FA: true,
                    tempToken: "temp-token-e2e",
                    user: null,
                },
            });
        }

        if (method === "GET" && path === "/categories") {
            return json(route, {
                success: true,
                data: [
                    { id: "cat-phone", name: "Điện thoại" },
                    { id: "cat-fashion", name: "Thời trang" },
                ],
            });
        }

        if (method === "GET" && path === "/products") {
            const search = url.searchParams.get("search") || "";
            const rows = search.toLowerCase().includes("iphone")
                ? [
                      product("prod-iphone", "iPhone 15 Pro", "22000000", [
                          "iphone",
                          "apple",
                      ]),
                  ]
                : [
                      product("prod-iphone", "iPhone 15 Pro", "22000000", [
                          "iphone",
                          "apple",
                      ]),
                      product("prod-case", "Ốp lưng trong suốt", "99000", [
                          "accessory",
                      ]),
                  ];
            return json(route, {
                success: true,
                data: rows,
                pagination: {
                    page: Number(url.searchParams.get("page") || 1),
                    limit: Number(url.searchParams.get("limit") || 12),
                    total: rows.length,
                    totalPages: 1,
                },
            });
        }

        if (path.startsWith("/saved-items")) {
            return json(route, { success: false, message: "Not authorized" }, 401);
        }

        return json(route, { success: false, message: "Unhandled E2E mock" }, 404);
    });
}

export async function mockAuthenticatedApi(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem("soco.accessToken", "e2e-access-token");
        window.localStorage.setItem("soco.refreshToken", "e2e-refresh-token");
    });

    await page.route(API_PATTERN, async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname.replace("/api", "");
        const method = route.request().method();

        if (method === "GET" && path === "/auth/me") {
            return json(route, { success: true, data: { user: buyerUser } });
        }

        if (method === "GET" && path === "/messages/conversations") {
            return json(route, { success: true, data: { items: [] } });
        }

        if (method === "POST" && path === "/ai-assistant/chat") {
            return json(route, {
                success: true,
                data: {
                    reply:
                        "Dựa trên dữ liệu RAG, iPhone 15 Pro phù hợp nếu bạn cần hiệu năng cao và camera tốt.",
                    followUps: ["So sánh với Samsung", "Thêm vào giỏ giúp tôi"],
                    quickActions: [
                        {
                            type: "add_to_cart",
                            label: "Thêm vào giỏ",
                            productId: "prod-iphone",
                        },
                        {
                            type: "view_product",
                            label: "Xem iPhone 15 Pro",
                            productId: "prod-iphone",
                            route: "/products/prod-iphone",
                        },
                    ],
                    memory: { lastIntent: "product_advice" },
                    cards: {
                        products: [
                            {
                                id: "prod-iphone",
                                title: "iPhone 15 Pro",
                                price: 22000000,
                                priceText: "22.000.000 ₫",
                                stockQuantity: 4,
                                category: "Điện thoại",
                                sellerName: "SoCo Seller",
                                imageUrl: null,
                                slug: "iphone-15-pro",
                            },
                        ],
                        orders: [],
                        sources: [
                            {
                                id: "product:prod-iphone",
                                sourceType: "product",
                                title: "iPhone 15 Pro",
                                route: "/products/prod-iphone",
                            },
                        ],
                    },
                    meta: {
                        intent: "product_advice",
                        matchedProducts: 1,
                        matchedOrders: 0,
                        ragSources: 1,
                    },
                },
            });
        }

        if (method === "POST" && path === "/cart/items") {
            return json(route, {
                success: true,
                data: { id: "cart-item-1", productId: "prod-iphone", quantity: 1 },
            });
        }

        return json(route, { success: true, data: [] });
    });
}

type BuyerMockOptions = {
    cart?: "empty" | "with-item";
    seedOrders?: boolean;
    seedConversations?: boolean;
    seedNotifications?: boolean;
};

function isoNowMinus(minutes: number) {
    return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function makeCartRaw(kind: NonNullable<BuyerMockOptions["cart"]>) {
    if (kind === "empty") {
        return {
            id: "cart-1",
            userId: buyerUser.id,
            subtotal: 0,
            totalItems: 0,
            items: [],
        };
    }

    return {
        id: "cart-1",
        userId: buyerUser.id,
        subtotal: 22000000,
        totalItems: 1,
        items: [
            {
                id: "cart-item-1",
                productId: "prod-iphone",
                price: 22000000,
                quantity: 1,
                product: {
                    id: "prod-iphone",
                    title: "iPhone 15 Pro",
                    price: 22000000,
                    images: [{ imageUrl: null }],
                    sellerId: "seller-1",
                    seller: { id: "seller-1", fullName: "SoCo Seller", username: "seller" },
                },
            },
        ],
    };
}

function makeOrderRaw(orderId: string) {
    return {
        id: orderId,
        orderNumber: "1001",
        status: "pending",
        createdAt: isoNowMinus(90),
        updatedAt: isoNowMinus(45),
        subtotal: 22000000,
        shippingFee: 30000,
        discount: 0,
        total: 22030000,
        shippingName: "Buyer Test",
        shippingPhone: "+84000000000",
        shippingAddress: "1 Test Street",
        paymentMethod: "COD",
        buyer: { fullName: buyerUser.fullName, username: buyerUser.username },
        items: [
            {
                id: "order-item-1",
                productId: "prod-iphone",
                productName: "iPhone 15 Pro",
                productImageUrl: null,
                unitPrice: 22000000,
                quantity: 1,
            },
        ],
    };
}

function makeConversationRaw() {
    return {
        id: "conv-1",
        participants: [
            { user: { id: buyerUser.id, fullName: buyerUser.fullName, username: buyerUser.username, avatarUrl: null } },
            { user: { id: "seller-1", fullName: "Seller One", username: "seller1", avatarUrl: null } },
        ],
        unreadCount: 0,
        updatedAt: isoNowMinus(10),
        lastMessage: {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "seller-1",
            content: "Hello! How can I help?",
            messageType: "TEXT",
            createdAt: isoNowMinus(12),
        },
    };
}

function makeMessageThreadRaw(conversationId: string) {
    return [
        {
            id: "msg-1",
            conversationId,
            senderId: "seller-1",
            content: "Hello! How can I help?",
            messageType: "TEXT",
            createdAt: isoNowMinus(12),
        },
    ];
}

function makeNotificationRaw(id: string) {
    return {
        id,
        type: "system",
        title: "Welcome",
        content: "Thanks for trying SoCo!",
        isRead: false,
        createdAt: isoNowMinus(5),
        link: "/feed",
        iconType: "system",
    };
}

function makeGroupRaw(id: string) {
    return {
        id,
        name: "SoCo Community",
        description: "A public test group",
        privacy: "public",
        avatarUrl: null,
        coverImageUrl: null,
        category: "community",
        createdAt: isoNowMinus(5000),
        updatedAt: isoNowMinus(1000),
        membersCount: 123,
        postsCount: 12,
        postsPerDay: 1,
        friendsInGroup: 0,
        isMember: false,
        isAdmin: false,
        isOwner: false,
    };
}

/**
 * Comprehensive authenticated mock for UI E2E specs (cart/checkout/orders/messages/notifications/groups/feed).
 * Use this instead of `mockAuthenticatedApi` when you need deterministic page loads.
 */
export async function mockBuyerApi(page: Page, options: BuyerMockOptions = {}) {
    const cartKind = options.cart ?? "empty";
    const seedOrders = options.seedOrders ?? false;
    const seedConversations = options.seedConversations ?? false;
    const seedNotifications = options.seedNotifications ?? false;

    const state = {
        cartRaw: makeCartRaw(cartKind),
        orders: seedOrders ? [makeOrderRaw("order-1")] : [],
        conversations: seedConversations ? [makeConversationRaw()] : [],
        messagesByConversation: new Map<string, ReturnType<typeof makeMessageThreadRaw>>(),
        notifications: seedNotifications ? [makeNotificationRaw("notif-1")] : [],
        groups: [makeGroupRaw("group-1")],
    };
    for (const c of state.conversations) {
        state.messagesByConversation.set(c.id, makeMessageThreadRaw(c.id));
    }

    await page.addInitScript(() => {
        window.localStorage.setItem("soco.accessToken", "e2e-access-token");
        window.localStorage.setItem("soco.refreshToken", "e2e-refresh-token");
    });

    await page.route(API_PATTERN, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace("/api", "");
        const method = request.method();

        // Auth
        if (method === "POST" && path === "/auth/login") {
            return json(route, {
                success: true,
                data: {
                    requires2FA: false,
                    accessToken: "e2e-access-token",
                    refreshToken: "e2e-refresh-token",
                    user: buyerUser,
                },
            });
        }

        if (method === "GET" && path === "/auth/me") {
            return json(route, { success: true, data: { user: buyerUser } });
        }

        // Marketplace (minimal)
        if (method === "GET" && path === "/categories") {
            return json(route, {
                success: true,
                data: [
                    { id: "cat-phone", name: "Điện thoại" },
                    { id: "cat-fashion", name: "Thời trang" },
                ],
            });
        }

        if (method === "GET" && path === "/products") {
            const rows = [
                product("prod-iphone", "iPhone 15 Pro", "22000000", ["iphone", "apple"]),
                product("prod-case", "Ốp lưng trong suốt", "99000", ["accessory"]),
            ];
            return json(route, {
                success: true,
                data: rows,
                pagination: {
                    page: Number(url.searchParams.get("page") || 1),
                    limit: Number(url.searchParams.get("limit") || 12),
                    total: rows.length,
                    totalPages: 1,
                },
            });
        }

        if (method === "GET" && path.startsWith("/products/")) {
            const id = path.split("/").pop() || "prod-iphone";
            return json(route, {
                success: true,
                data: {
                    ...product(id, id === "prod-case" ? "Ốp lưng trong suốt" : "iPhone 15 Pro", id === "prod-case" ? "99000" : "22000000"),
                    description: "E2E mock product",
                    stockQuantity: 10,
                },
            });
        }

        if (method === "GET" && path.startsWith("/reviews/product/")) {
            return json(route, {
                success: true,
                data: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
            });
        }

        if (path === "/products/search-events" || path.endsWith("/view")) {
            return json(route, { success: true, data: {} });
        }

        // Feed (empty but valid)
        if (method === "GET" && path === "/posts") {
            return json(route, {
                success: true,
                data: [],
                pagination: {
                    page: Number(url.searchParams.get("page") || 1),
                    limit: 10,
                    total: 0,
                },
            });
        }

        // Cart
        if (method === "GET" && path === "/cart") {
            return json(route, { success: true, data: state.cartRaw });
        }
        if (method === "POST" && path === "/cart/items") {
            const body = request.postDataJSON?.() as { productId?: string; quantity?: number } | undefined;
            const productId = body?.productId ?? "prod-iphone";
            const quantity = Number(body?.quantity ?? 1);
            const items = Array.isArray((state.cartRaw as any).items) ? ((state.cartRaw as any).items as any[]) : [];
            const existing = items.find((i) => i.productId === productId);
            if (existing) existing.quantity = (existing.quantity ?? 1) + quantity;
            else {
                items.push({
                    id: `cart-item-${items.length + 1}`,
                    productId,
                    price: productId === "prod-case" ? 99000 : 22000000,
                    quantity,
                    product: {
                        id: productId,
                        title: productId === "prod-case" ? "Ốp lưng trong suốt" : "iPhone 15 Pro",
                        price: productId === "prod-case" ? 99000 : 22000000,
                        images: [{ imageUrl: null }],
                        sellerId: "seller-1",
                        seller: { id: "seller-1", fullName: "SoCo Seller", username: "seller" },
                    },
                });
            }
            (state.cartRaw as any).items = items;
            (state.cartRaw as any).totalItems = items.reduce((s, i) => s + Number(i.quantity ?? 1), 0);
            (state.cartRaw as any).subtotal = items.reduce((s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
            return json(route, { success: true, data: state.cartRaw });
        }
        if (method === "PUT" && path.startsWith("/cart/items/")) {
            const cartItemId = path.split("/").pop();
            const body = request.postDataJSON?.() as { quantity?: number } | undefined;
            const quantity = Math.max(1, Number(body?.quantity ?? 1));
            const items = ((state.cartRaw as any).items as any[]) ?? [];
            const existing = items.find((i) => String(i.id) === String(cartItemId));
            if (existing) existing.quantity = quantity;
            (state.cartRaw as any).totalItems = items.reduce((s, i) => s + Number(i.quantity ?? 1), 0);
            (state.cartRaw as any).subtotal = items.reduce((s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
            return json(route, { success: true, data: state.cartRaw });
        }
        if (method === "DELETE" && path.startsWith("/cart/items/")) {
            const cartItemId = path.split("/").pop();
            const items = ((state.cartRaw as any).items as any[]) ?? [];
            (state.cartRaw as any).items = items.filter((i) => String(i.id) !== String(cartItemId));
            const nextItems = ((state.cartRaw as any).items as any[]) ?? [];
            (state.cartRaw as any).totalItems = nextItems.reduce((s, i) => s + Number(i.quantity ?? 1), 0);
            (state.cartRaw as any).subtotal = nextItems.reduce((s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
            return json(route, { success: true, data: state.cartRaw });
        }
        if (method === "DELETE" && path === "/cart") {
            state.cartRaw = makeCartRaw("empty");
            return json(route, { success: true, data: state.cartRaw });
        }

        // Orders
        if (method === "POST" && path === "/orders") {
            const orderId = `order-${state.orders.length + 1}`;
            const created = makeOrderRaw(orderId);
            state.orders.unshift(created);
            return json(route, { success: true, data: created });
        }
        if (method === "GET" && path === "/orders/my/purchases") {
            const page = Number(url.searchParams.get("page") || 1);
            const limit = Number(url.searchParams.get("limit") || 10);
            const total = state.orders.length;
            return json(route, {
                data: state.orders,
                pagination: { page, limit, total, totalPages: 1 },
            });
        }
        if (method === "GET" && path.startsWith("/orders/")) {
            const id = path.split("/").pop() || "order-1";
            const found = state.orders.find((o) => String((o as any).id) === String(id)) ?? makeOrderRaw(id);
            return json(route, { success: true, data: found });
        }

        // Messaging
        if (method === "GET" && path === "/messages/conversations") {
            return json(route, {
                success: true,
                data: state.conversations,
                pagination: { page: 1, limit: 20, total: state.conversations.length, totalPages: 1 },
            });
        }
        if (method === "GET" && path.startsWith("/messages/conversations/")) {
            const conversationId = path.split("/")[3];
            const rows = state.messagesByConversation.get(conversationId) ?? [];
            return json(route, {
                success: true,
                data: rows,
                pagination: { page: 1, limit: 50, total: rows.length, totalPages: 1 },
            });
        }
        if (method === "POST" && path === "/messages/conversations") {
            const body = request.postDataJSON?.() as { userId?: string } | undefined;
            const userId = body?.userId ?? "seller-1";
            const conv = makeConversationRaw();
            (conv.participants as any[])[1].user.id = userId;
            state.conversations.unshift(conv);
            state.messagesByConversation.set(conv.id, makeMessageThreadRaw(conv.id));
            return json(route, { success: true, data: conv });
        }
        if (method === "POST" && path.startsWith("/messages/conversations/")) {
            const conversationId = path.split("/")[3];
            const body = request.postDataJSON?.() as { content?: string; messageType?: string; mediaUrl?: string | null } | undefined;
            const rows = state.messagesByConversation.get(conversationId) ?? [];
            const next = {
                id: `msg-${rows.length + 1}`,
                conversationId,
                senderId: buyerUser.id,
                content: body?.content ?? "",
                messageType: body?.messageType ?? "TEXT",
                mediaUrl: body?.mediaUrl ?? null,
                createdAt: new Date().toISOString(),
            };
            rows.push(next);
            state.messagesByConversation.set(conversationId, rows);
            return json(route, { success: true, data: next });
        }
        if (method === "PATCH" && path.endsWith("/read")) {
            return json(route, { success: true, data: {} });
        }

        // Notifications
        if (method === "GET" && path === "/notifications") {
            const unreadCount = state.notifications.filter((n) => !(n as any).isRead).length;
            return json(route, {
                notifications: state.notifications,
                total: state.notifications.length,
                unreadCount,
            });
        }
        if (method === "GET" && path === "/notifications/preferences") {
            return json(route, { social: true, order: true, system: true });
        }
        if (method === "PATCH" && (path === "/notifications/read-all" || path.endsWith("/read"))) {
            for (const n of state.notifications) (n as any).isRead = true;
            return json(route, { success: true, data: {} });
        }
        if (method === "PUT" && path === "/notifications/preferences") {
            return json(route, { success: true, data: {} });
        }

        // Groups
        if (method === "GET" && path === "/groups") {
            return json(route, {
                success: true,
                data: state.groups,
                pagination: { page: 1, limit: 12, total: state.groups.length, totalPages: 1 },
            });
        }
        if (method === "GET" && path === "/groups/me") {
            return json(route, {
                success: true,
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
            });
        }
        if (method === "GET" && path.startsWith("/groups/") && !path.includes("/posts") && !path.includes("/members") && !path.includes("/media") && !path.includes("/products") && !path.includes("/requests") && !path.includes("/invites")) {
            const groupId = path.split("/")[2];
            const g = state.groups.find((x) => String((x as any).id) === String(groupId)) ?? makeGroupRaw(groupId);
            return json(route, { success: true, data: g });
        }
        if (method === "GET" && path.includes("/posts")) {
            return json(route, {
                success: true,
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
            });
        }

        // Default: return empty successful response so UI can render.
        if (method === "GET") return json(route, { success: true, data: [] });
        return json(route, { success: true, data: {} });
    });
}
