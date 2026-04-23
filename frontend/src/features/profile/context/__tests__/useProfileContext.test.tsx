import { renderHook } from "@testing-library/react";
import { useProfileContext } from "../ProfileContext";

describe("useProfileContext", () => {
    it("throws when used outside ProfileProvider", () => {
        expect(() => {
            renderHook(() => useProfileContext());
        }).toThrow("useProfileContext must be used within a ProfileProvider");
    });
});
