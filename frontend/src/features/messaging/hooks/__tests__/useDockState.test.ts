import { renderHook, act } from "@testing-library/react";
import { useDockState } from "../useDockState";

function setup() {
    const loadMessages = vi.fn().mockResolvedValue([]);
    const markRead = vi.fn().mockResolvedValue(undefined);
    return {
        loadMessages,
        markRead,
        ...renderHook(() =>
            useDockState({
                loadMessagesForConversation: loadMessages,
                markConversationRead: markRead,
            }),
        ),
    };
}

describe("useDockState", () => {
    it("starts with empty dock", () => {
        const { result } = setup();
        expect(result.current.dockOpenIds).toEqual([]);
        expect(result.current.dockAvatarIds).toEqual([]);
        expect(result.current.dockExpanded).toBe(false);
    });

    it("openInDock adds to both open and avatar lists", () => {
        const { result, loadMessages, markRead } = setup();

        act(() => {
            result.current.openInDock("conv-1");
        });

        expect(result.current.dockOpenIds).toEqual(["conv-1"]);
        expect(result.current.dockAvatarIds).toEqual(["conv-1"]);
        expect(result.current.dockExpanded).toBe(true);
        expect(loadMessages).toHaveBeenCalledWith("conv-1");
        expect(markRead).toHaveBeenCalledWith("conv-1");
    });

    it("minimizeDockChat removes from open but keeps avatar", () => {
        const { result } = setup();

        act(() => {
            result.current.openInDock("conv-1");
        });
        act(() => {
            result.current.minimizeDockChat("conv-1");
        });

        expect(result.current.dockOpenIds).toEqual([]);
        expect(result.current.dockAvatarIds).toEqual(["conv-1"]);
    });

    it("closeDockChat removes from both lists", () => {
        const { result } = setup();

        act(() => {
            result.current.openInDock("conv-1");
        });
        act(() => {
            result.current.closeDockChat("conv-1");
        });

        expect(result.current.dockOpenIds).toEqual([]);
        expect(result.current.dockAvatarIds).toEqual([]);
    });

    it("toggleDockPanel toggles between open and minimized", () => {
        const { result } = setup();

        act(() => {
            result.current.openInDock("conv-1");
        });

        // Toggle off (minimize)
        act(() => {
            result.current.toggleDockPanel("conv-1");
        });
        expect(result.current.dockOpenIds).toEqual([]);

        // Toggle on (re-open)
        act(() => {
            result.current.toggleDockPanel("conv-1");
        });
        expect(result.current.dockOpenIds).toEqual(["conv-1"]);
    });

    it("limits open panels to 3", () => {
        const { result } = setup();

        act(() => {
            result.current.openInDock("c1");
            result.current.openInDock("c2");
            result.current.openInDock("c3");
            result.current.openInDock("c4");
        });

        expect(result.current.dockOpenIds.length).toBeLessThanOrEqual(3);
    });

    it("resetDock clears everything", () => {
        const { result } = setup();

        act(() => {
            result.current.openInDock("conv-1");
        });
        act(() => {
            result.current.resetDock();
        });

        expect(result.current.dockOpenIds).toEqual([]);
        expect(result.current.dockAvatarIds).toEqual([]);
        expect(result.current.dockExpanded).toBe(false);
    });
});
