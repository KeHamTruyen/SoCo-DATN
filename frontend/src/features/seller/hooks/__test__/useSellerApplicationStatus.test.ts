import { renderHook, act, waitFor } from "@testing-library/react";
import { useSellerApplicationStatus } from "../useSellerApplicationStatus";
import { sellerApi } from "../../api/sellerApi";
import { HttpError } from "../../../../shared/api/httpClient";

vi.mock("../../api/sellerApi", () => ({
    sellerApi: {
        getApplicationStatus: vi.fn(),
        withdrawReviewingApplication: vi.fn(),
    },
}));

describe("useSellerApplicationStatus", () => {
    beforeEach(() => {
        vi.mocked(sellerApi.getApplicationStatus).mockReset();
        vi.mocked(sellerApi.withdrawReviewingApplication).mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads application status on mount", async () => {
        vi.mocked(sellerApi.getApplicationStatus).mockResolvedValue({
            status: "NONE",
        } as never);

        const { result } = renderHook(() => useSellerApplicationStatus());

        await waitFor(() => {
            expect(result.current.statusLoading).toBe(false);
            expect(result.current.applicationStatus).toEqual({ status: "NONE" });
        });
    });

    it("sets statusError when load fails", async () => {
        vi.mocked(sellerApi.getApplicationStatus).mockRejectedValue(new Error("network"));

        const { result } = renderHook(() => useSellerApplicationStatus());

        await waitFor(() => {
            expect(result.current.statusError).toBe("network");
            expect(result.current.statusLoading).toBe(false);
        });
    });

    it("withdraw calls API when user confirms", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        vi.mocked(sellerApi.getApplicationStatus).mockResolvedValue({ status: "REVIEWING" } as never);
        vi.mocked(sellerApi.withdrawReviewingApplication).mockResolvedValue(undefined as never);

        const { result } = renderHook(() => useSellerApplicationStatus());

        await waitFor(() => expect(result.current.statusLoading).toBe(false));

        await act(async () => {
            await result.current.handleWithdrawReviewingApplication();
        });

        expect(sellerApi.withdrawReviewingApplication).toHaveBeenCalled();
    });

    it("withdraw skips API when user cancels", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);
        vi.mocked(sellerApi.getApplicationStatus).mockResolvedValue({ status: "REVIEWING" } as never);

        const { result } = renderHook(() => useSellerApplicationStatus());

        await waitFor(() => expect(result.current.statusLoading).toBe(false));

        await act(async () => {
            await result.current.handleWithdrawReviewingApplication();
        });

        expect(sellerApi.withdrawReviewingApplication).not.toHaveBeenCalled();
    });

    it("withdraw sets withdrawError on HttpError", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        vi.mocked(sellerApi.getApplicationStatus).mockResolvedValue({ status: "REVIEWING" } as never);
        vi.mocked(sellerApi.withdrawReviewingApplication).mockRejectedValue(new HttpError("Denied", 400));

        const { result } = renderHook(() => useSellerApplicationStatus());

        await waitFor(() => expect(result.current.statusLoading).toBe(false));

        await act(async () => {
            await result.current.handleWithdrawReviewingApplication();
        });

        expect(result.current.withdrawError).toBe("Denied");
    });
});
