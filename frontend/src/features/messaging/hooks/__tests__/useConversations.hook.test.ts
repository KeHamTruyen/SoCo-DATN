import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useConversations } from "../useConversations";
import type { Conversation } from "../../types/messaging.types";
import { queryKeys } from "../../../../shared/query/queryKeys";

vi.mock("../../api/messagingApi", () => ({
    messagingApi: {
        listConversations: vi.fn(),
    },
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

const conv: Conversation = {
    id: "c1",
    participantId: "u2",
    participantName: "P",
    isOnline: false,
    unreadCount: 2,
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    lastMessageIsOwn: false,
};

describe("useConversations (hook)", () => {
    beforeEach(() => {
        vi.mocked(messagingApi.listConversations).mockReset();
        vi.mocked(messagingApi.listConversations).mockResolvedValue({ items: [conv] });
    });

    it("does not fetch when userId is undefined", () => {
        const { result } = renderHook(() => useConversations(undefined), { wrapper: createWrapper() });
        expect(result.current.conversations).toEqual([]);
        expect(messagingApi.listConversations).not.toHaveBeenCalled();
    });

    it("loads conversations when userId is set", async () => {
        const { result } = renderHook(() => useConversations("u1"), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.conversations).toHaveLength(1));
        expect(messagingApi.listConversations).toHaveBeenCalledWith("u1");
        expect(result.current.totalUnread).toBe(2);
        expect(result.current.unreadChatsCount).toBe(1);
    });

    it("refreshConversations clears cache when userId missing", async () => {
        const { result, rerender } = renderHook(({ uid }: { uid?: string }) => useConversations(uid), {
            wrapper: createWrapper(),
            initialProps: { uid: "u1" as string | undefined },
        });

        await waitFor(() => expect(result.current.conversations).toHaveLength(1));

        rerender({ uid: undefined });

        await act(async () => {
            await result.current.refreshConversations();
        });

        expect(result.current.conversations).toEqual([]);
    });

    it("updateConversationPreview mutates conversation list", async () => {
        const { result } = renderHook(() => useConversations("u1"), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.conversations).toHaveLength(1));

        act(() => {
            result.current.updateConversationPreview("c1", "Hi", "2020-01-01T00:00:00.000Z", true);
        });

        await waitFor(() => {
            expect(result.current.conversations[0].lastMessage).toBe("Hi");
            expect(result.current.conversations[0].lastMessageIsOwn).toBe(true);
        });
        const cached = testQueryClient.getQueryData<Conversation[]>(queryKeys.messaging.conversations("u1"));
        expect(cached?.[0].lastMessage).toBe("Hi");
    });

    it("clearUnread zeros unread for a conversation", async () => {
        const { result } = renderHook(() => useConversations("u1"), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.totalUnread).toBe(2));

        act(() => {
            result.current.clearUnread("c1");
        });

        await waitFor(() => {
            expect(result.current.conversations[0].unreadCount).toBe(0);
            expect(result.current.totalUnread).toBe(0);
        });
    });
});
