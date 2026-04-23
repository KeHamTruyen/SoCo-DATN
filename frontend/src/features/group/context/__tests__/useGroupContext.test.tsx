import { renderHook } from "@testing-library/react";
import { useGroupContext } from "../GroupContext";

describe("useGroupContext", () => {
    it("throws when used outside GroupProvider", () => {
        expect(() => {
            renderHook(() => useGroupContext());
        }).toThrow("useGroupContext must be used within GroupProvider");
    });
});
