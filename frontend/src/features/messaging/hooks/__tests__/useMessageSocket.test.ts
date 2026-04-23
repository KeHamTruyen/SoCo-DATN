import type { RefObject } from "react";
import { renderHook, act } from "@testing-library/react";
import { useMessageSocket } from "../useMessageSocket";
import type { Conversation } from "../../types/messaging.types";

vi.mock("../../api/messagingApi", () => ({
    messagingApi: {
        markConversationRead: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock("../../../../i18n", () => ({
    default: { t: (k: string) => k },
}));

import { messagingApi } from "../../api/messagingApi";

function createFakeSocket() {
    const handlers = new Map<string, Array<(...args: unknown[]) => void>>();
    const socket = {
        emit: vi.fn((event: string, ...args: unknown[]) => {
            void event;
            void args;
        }),
        on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
            const list = handlers.get(event) ?? [];
            list.push(fn);
            handlers.set(event, list);
        }),
        off: vi.fn((event: string, fn?: (...args: unknown[]) => void) => {
            if (!fn) {
                handlers.delete(event);
                return;
            }
            const list = handlers.get(event)?.filter((f) => f !== fn) ?? [];
            handlers.set(event, list);
        }),
        trigger(event: string, payload: unknown) {
            handlers.get(event)?.forEach((fn) => {
                fn(payload);
            });
        },
    };
    return socket;
}

function refNull<T>(): RefObject<T | null> {
    return { current: null };
}

function refArray<T>(initial: T[]): RefObject<T[]> {
    return { current: initial };
}

const baseConv: Conversation = {
    id: "c1",
    participantId: "u2",
    participantName: "Peer",
    isOnline: true,
    unreadCount: 0,
};

describe("useMessageSocket", () => {
    const appendSocketMessage = vi.fn();
    const updateConversationPreview = vi.fn();
    const incrementUnread = vi.fn();
    const clearUnread = vi.fn();
    const refreshConversations = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        appendSocketMessage.mockReset();
        updateConversationPreview.mockReset();
        incrementUnread.mockReset();
        clearUnread.mockReset();
        refreshConversations.mockReset();
        vi.mocked(messagingApi.markConversationRead).mockClear();
    });

    it("emits join for each conversation id", () => {
        const socket = createFakeSocket();
        const activeRef = refNull<string>();
        const dockRef = refArray<string>([]);

        renderHook(() =>
            useMessageSocket({
                socket: socket as never,
                userId: "u1",
                conversations: [baseConv],
                activeConversationIdRef: activeRef,
                dockOpenIdsRef: dockRef,
                appendSocketMessage,
                updateConversationPreview,
                incrementUnread,
                clearUnread,
                refreshConversations,
            }),
        );

        expect(socket.emit).toHaveBeenCalledWith("conversation:join", "c1");
    });

    it("on message:new updates preview and increments unread when not viewing", () => {
        const socket = createFakeSocket();
        const activeRef = refNull<string>();
        const dockRef = refArray<string>([]);

        const raw = {
            id: "m99",
            conversationId: "c1",
            senderId: "u2",
            content: "hey",
            messageType: "text",
            createdAt: new Date().toISOString(),
        };

        renderHook(() =>
            useMessageSocket({
                socket: socket as never,
                userId: "u1",
                conversations: [baseConv],
                activeConversationIdRef: activeRef,
                dockOpenIdsRef: dockRef,
                appendSocketMessage,
                updateConversationPreview,
                incrementUnread,
                clearUnread,
                refreshConversations,
            }),
        );

        act(() => {
            socket.trigger("message:new", raw);
        });

        expect(appendSocketMessage).toHaveBeenCalled();
        expect(updateConversationPreview).toHaveBeenCalled();
        expect(incrementUnread).toHaveBeenCalledWith("c1");
    });

    it("refreshes conversations when message targets unknown conversation", () => {
        const socket = createFakeSocket();
        const activeRef = refNull<string>();
        const dockRef = refArray<string>([]);

        const raw = {
            id: "m1",
            conversationId: "unknown",
            senderId: "u2",
            content: "x",
            messageType: "text",
            createdAt: new Date().toISOString(),
        };

        renderHook(() =>
            useMessageSocket({
                socket: socket as never,
                userId: "u1",
                conversations: [baseConv],
                activeConversationIdRef: activeRef,
                dockOpenIdsRef: dockRef,
                appendSocketMessage,
                updateConversationPreview,
                incrementUnread,
                clearUnread,
                refreshConversations,
            }),
        );

        act(() => {
            socket.trigger("message:new", raw);
        });

        expect(refreshConversations).toHaveBeenCalled();
    });
});
