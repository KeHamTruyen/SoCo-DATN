import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatActions } from "../useChatActions";

// Mock uploadApi
vi.mock("../../../upload/api/uploadApi", () => ({
    uploadApi: {
        uploadPostMedia: vi.fn().mockResolvedValue({ url: "https://cdn.test/img.webp" }),
    },
}));

function setup(sendMock = vi.fn().mockResolvedValue(undefined)) {
    return renderHook(() => useChatActions({ sendMessage: sendMock }));
}

describe("useChatActions", () => {
    it("does not send empty text", async () => {
        const sendMock = vi.fn();
        const { result } = setup(sendMock);

        await act(async () => {
            await result.current.handleSend("conv-1", "   ");
        });

        expect(sendMock).not.toHaveBeenCalled();
    });

    it("calls sendMessage with trimmed text", async () => {
        const sendMock = vi.fn().mockResolvedValue(undefined);
        const { result } = setup(sendMock);

        await act(async () => {
            await result.current.handleSend("conv-1", "  hello  ");
        });

        expect(sendMock).toHaveBeenCalledWith("conv-1", "hello");
    });

    it("tracks sending state", async () => {
        let resolveSend!: () => void;
        const sendMock = vi.fn(
            () => new Promise<void>((r) => { resolveSend = r; }),
        );
        const { result } = setup(sendMock);

        expect(result.current.isSending("conv-1")).toBe(false);

        let promise: Promise<void>;
        act(() => {
            promise = result.current.handleSend("conv-1", "hi");
        });

        // sendingId should now be "conv-1"
        expect(result.current.isSending("conv-1")).toBe(true);
        expect(result.current.isSending("conv-2")).toBe(false);

        await act(async () => {
            resolveSend();
            await promise!;
        });

        expect(result.current.isSending("conv-1")).toBe(false);
    });

    it("calls sendMessage with IMAGE payload for attachImage", async () => {
        const sendMock = vi.fn().mockResolvedValue(undefined);
        const { result } = setup(sendMock);

        const file = new File(["img"], "photo.png", { type: "image/png" });

        await act(async () => {
            await result.current.handleAttachImage("conv-1", file);
        });

        expect(sendMock).toHaveBeenCalledWith("conv-1", {
            messageType: "IMAGE",
            mediaUrl: "https://cdn.test/img.webp",
        });
    });
});
