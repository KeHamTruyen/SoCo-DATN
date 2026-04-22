export const queryKeys = {
    feed: {
        all: ["feed"] as const,
        list: (scope: string) => ["feed", "list", scope] as const,
        userPosts: (userId: string) => ["feed", "userPosts", userId] as const,
    },
    group: {
        all: ["group"] as const,
        detail: (groupId: string) => ["group", "detail", groupId] as const,
        posts: (groupId: string) => ["group", "posts", groupId] as const,
    },
    profile: {
        all: ["profile"] as const,
        detail: (userId: string) => ["profile", "detail", userId] as const,
    },
    marketplace: {
        all: ["marketplace"] as const,
        products: (signature: string) => ["marketplace", "products", signature] as const,
        categories: ["marketplace", "categories"] as const,
        recommendations: (isAuthenticated: boolean) =>
            ["marketplace", "recommendations", isAuthenticated] as const,
    },
    product: {
        detail: (productId: string) => ["product", "detail", productId] as const,
        reviews: (productId: string, signature: string) =>
            ["product", "reviews", productId, signature] as const,
    },
    order: {
        all: ["order"] as const,
        detail: (orderId: string) => ["order", "detail", orderId] as const,
    },
    messaging: {
        all: ["messaging"] as const,
        conversations: (userId: string) => ["messaging", "conversations", userId] as const,
        messages: (conversationId: string) =>
            ["messaging", "messages", conversationId] as const,
    },
} as const;
