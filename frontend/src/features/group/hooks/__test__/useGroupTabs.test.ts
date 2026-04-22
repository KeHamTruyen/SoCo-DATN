import { renderHook, act } from "@testing-library/react";
import { useGroupTabs } from "../useGroupTabs";

describe("useGroupTabs", () => {
    it("should initialize with default 'discussion' tab", () => {
        const { result } = renderHook(() => useGroupTabs());
        expect(result.current.activeTab).toBe("discussion");
    });

    it("should support custom default tab", () => {
        const { result } = renderHook(() => useGroupTabs("members"));
        expect(result.current.activeTab).toBe("members");
    });

    it("should handle switching tabs", () => {
        const { result } = renderHook(() => useGroupTabs());
        
        act(() => {
            result.current.setActiveTab("products");
        });
        expect(result.current.activeTab).toBe("products");

        act(() => {
            result.current.setActiveTab("media");
        });
        expect(result.current.activeTab).toBe("media");
    });
});
