import { renderHook } from "@testing-library/react";
import { useMessaging, useMessagingOptional } from "../MessagingContext";

describe("messaging context consumers", () => {
    it("useMessagingOptional returns null outside provider", () => {
        const { result } = renderHook(() => useMessagingOptional());
        expect(result.current).toBeNull();
    });

    it("useMessaging throws outside provider", () => {
        expect(() => {
            renderHook(() => useMessaging());
        }).toThrow("useMessaging must be used within MessagingProvider");
    });
});
