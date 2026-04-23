import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { useMessageThreads } from "../useMessageThreads";

vi.mock("../../api/messagingApi", () => ({
    messagingApi: {
        listMessages: vi.fn(),
        sendMessage: vi.fn(),
        markConversationRead: vi.fn(),
        startConversation: vi.fn(),
    },
}));

vi.mock("../../../../i18n", () => ({
    default: { t: (k: string) => k },
}));

import { messagingApi } from "../../api/messagingApi";

let testQueryClient: QueryClient;

function createWrapper() {
    testQueryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, refetchOnWindowFocus: false, staleTime: Infinity },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
}

const msg = {
    id: "m1",
    conversationId: "c1",
    senderId: "u1",
    content: "hello",
    createdAt: new Date().toISOString(),
    type: "text" as const,
};

describe("useMessageThreads", () => {
    const updateConversationPreview = vi.fn();
    const upsertConversation = vi.fn();
    const clearUnread = vi.fn();

    beforeEach(() => {
        vi.mocked(messagingApi.listMessages).mockReset();
        vi.mocked(messagingApi.sendMessage).mockReset();
        vi.mocked(messagingApi.markConversationRead).mockReset();
        vi.mocked(messagingApi.startConversation).mockReset();
        updateConversationPreview.mockReset();
        upsertConversation.mockReset();
        clearUnread.mockReset();
        vi.mocked(messagingApi.listMessages).mockResolvedValue({ items: [msg] });
    });

    it("loadMessagesForConversation stores messages", async () => {
        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            await result.current.loadMessagesForConversation("c1");
        });

        expect(result.current.messageThreads.c1).toHaveLength(1);
        expect(messagingApi.listMessages).toHaveBeenCalledWith("c1");
    });

    it("sendMessage appends message and updates preview", async () => {
        const sent = { ...msg, id: "m2", content: "out" };
        vi.mocked(messagingApi.sendMessage).mockResolvedValue(sent as never);

        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            await result.current.sendMessage("c1", "out");
        });

        expect(updateConversationPreview).toHaveBeenCalled();
        expect(result.current.messageThreads.c1?.some((m) => m.id === "m2")).toBe(true);
    });

    it("markConversationRead calls API and clearUnread", async () => {
        vi.mocked(messagingApi.markConversationRead).mockResolvedValue(undefined as never);

        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            await result.current.markConversationRead("c1");
        });

        expect(messagingApi.markConversationRead).toHaveBeenCalledWith("c1");
        expect(clearUnread).toHaveBeenCalledWith("c1");
    });

    it("startConversationWithUser upserts conversation", async () => {
        vi.mocked(messagingApi.startConversation).mockResolvedValue({
            conversationId: "new",
            conversation: { id: "new", unreadCount: 0 } as never,
        });

        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        let cid: string | undefined;
        await act(async () => {
            cid = await result.current.startConversationWithUser("u9");
        });

        expect(cid).toBe("new");
        expect(upsertConversation).toHaveBeenCalledWith("new", expect.any(Object));
    });

    it("appendSocketMessage ignores when thread not loaded", () => {
        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        act(() => {
            result.current.appendSocketMessage({ ...msg, id: "x" });
        });

        expect(result.current.messageThreads.c1).toBeUndefined();
    });

    it("resetThreads clears state", async () => {
        const { result } = renderHook(
            () =>
                useMessageThreads({
                    userId: "u1",
                    updateConversationPreview,
                    upsertConversation,
                    clearUnread,
                }),
            { wrapper: createWrapper() },
        );

        await act(async () => {
            await result.current.loadMessagesForConversation("c1");
        });

        act(() => {
            result.current.resetThreads();
        });

        expect(result.current.messageThreads).toEqual({});
    });
});
