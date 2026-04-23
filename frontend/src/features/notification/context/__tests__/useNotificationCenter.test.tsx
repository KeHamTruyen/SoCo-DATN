import { renderHook } from "@testing-library/react";
import { useNotificationCenter } from "../NotificationContext";

describe("useNotificationCenter", () => {
    it("throws when used outside NotificationProvider", () => {
        expect(() => {
            renderHook(() => useNotificationCenter());
        }).toThrow("useNotificationCenter must be used within NotificationProvider");
    });
});
