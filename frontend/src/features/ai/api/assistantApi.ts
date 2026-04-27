import { httpClient } from "../../../shared/api/httpClient";

export type AssistantRole = "user" | "assistant";

export type AssistantHistoryItem = {
    role: AssistantRole;
    content: string;
};

export type AssistantMemory = {
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredCategory?: string | null;
    shoppingGoal?: string | null;
    lastIntent?: string;
};

export type AssistantQuickAction = {
    type:
        | "view_product"
        | "add_to_cart"
        | "view_order_detail"
        | "view_orders"
        | "open_marketplace"
        | "open_messages";
    label: string;
    route?: string;
    productId?: string;
    orderId?: string;
};

export type AssistantProductCard = {
    id: string;
    title: string;
    price: number;
    priceText: string;
    stockQuantity: number | null;
    category: string | null;
    sellerName: string | null;
    imageUrl: string | null;
    slug: string;
};

export type AssistantOrderCard = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    totalText: string;
    createdAt: string;
};

export type AssistantResponse = {
    reply: string;
    followUps: string[];
    quickActions: AssistantQuickAction[];
    memory: AssistantMemory;
    cards: {
        products: AssistantProductCard[];
        orders: AssistantOrderCard[];
    };
    meta: {
        intent: string;
        matchedProducts: number;
        matchedOrders: number;
    };
};

type ApiWrapped<T> = {
    success?: boolean;
    data?: T;
};

function unwrap<T>(res: ApiWrapped<T> | T): T {
    if (res && typeof res === "object" && "data" in res) {
        return (res as ApiWrapped<T>).data as T;
    }
    return res as T;
}

export const assistantApi = {
    async chat(payload: {
        message: string;
        history: AssistantHistoryItem[];
        memory?: AssistantMemory;
    }): Promise<AssistantResponse> {
        const response = await httpClient.post<ApiWrapped<AssistantResponse>>(
            "/ai-assistant/chat",
            payload,
            { requiresAuth: true },
        );
        return unwrap(response);
    },
};
