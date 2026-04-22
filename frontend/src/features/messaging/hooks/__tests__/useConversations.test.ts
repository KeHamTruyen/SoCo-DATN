import { previewFromMessage } from "../useConversations";
import type { Message } from "../../types/messaging.types";

function makeMessage(overrides: Partial<Message> = {}): Message {
    return {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "user-1",
        content: "Hello world",
        createdAt: new Date().toISOString(),
        type: "text",
        ...overrides,
    };
}

describe("previewFromMessage", () => {
    it("returns content for text messages", () => {
        const msg = makeMessage({ type: "text", content: "Hi there" });
        expect(previewFromMessage(msg, "[Photo]")).toBe("Hi there");
    });

    it("returns photo label for image messages", () => {
        const msg = makeMessage({
            type: "image",
            content: "",
            mediaUrl: "https://example.com/img.jpg",
        });
        expect(previewFromMessage(msg, "[Photo]")).toBe("[Photo]");
    });

    it("returns product name for product messages", () => {
        const msg = makeMessage({
            type: "product",
            content: "",
            product: {
                id: "p1",
                name: "Cool Widget",
                price: 19.99,
            },
        });
        expect(previewFromMessage(msg, "[Photo]")).toBe("[Product] Cool Widget");
    });

    it("falls back to content when product message has no product data", () => {
        const msg = makeMessage({
            type: "product",
            content: "some fallback",
            product: undefined,
        });
        expect(previewFromMessage(msg, "[Photo]")).toBe("some fallback");
    });
});
