import { renderHook, act } from "@testing-library/react";
import { useAuthActions } from "../useAuthActions";
import { authApi } from "../../api/authApi";

const authSessionMocks = vi.hoisted(() => ({
    completeAuth: vi.fn(),
}));

vi.mock("../../api/authApi", () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        verify2fa: vi.fn(),
        verifyAccount: vi.fn(),
        resendVerification: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
}));

vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        completeAuth: authSessionMocks.completeAuth,
    }),
}));

describe("useAuthActions", () => {
    beforeEach(() => {
        vi.mocked(authApi.login).mockReset();
        vi.mocked(authApi.register).mockReset();
        vi.mocked(authApi.verify2fa).mockReset();
        vi.mocked(authApi.verifyAccount).mockReset();
        vi.mocked(authApi.resendVerification).mockReset();
        vi.mocked(authApi.forgotPassword).mockReset();
        vi.mocked(authApi.resetPassword).mockReset();
        authSessionMocks.completeAuth.mockReset();
    });

    it("completeLogin forwards payload to completeAuth", () => {
        const { result } = renderHook(() => useAuthActions());
        const payload = { accessToken: "t", user: { id: "1" } } as never;

        act(() => {
            result.current.completeLogin(payload);
        });

        expect(authSessionMocks.completeAuth).toHaveBeenCalledWith(payload);
    });

    it("login delegates to authApi.login", async () => {
        vi.mocked(authApi.login).mockResolvedValue({} as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.login({ email: "a@b.com", password: "x" } as never);
        });

        expect(authApi.login).toHaveBeenCalledWith({ email: "a@b.com", password: "x" });
    });

    it("register delegates to authApi.register", async () => {
        vi.mocked(authApi.register).mockResolvedValue({} as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.register({ email: "a@b.com", password: "x", fullName: "A" } as never);
        });

        expect(authApi.register).toHaveBeenCalled();
    });

    it("verify2fa delegates to authApi.verify2fa", async () => {
        vi.mocked(authApi.verify2fa).mockResolvedValue({} as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.verify2fa({ email: "a@b.com", code: "123456" } as never);
        });

        expect(authApi.verify2fa).toHaveBeenCalledWith({ email: "a@b.com", code: "123456" });
    });

    it("verifyAccount delegates to authApi.verifyAccount", async () => {
        vi.mocked(authApi.verifyAccount).mockResolvedValue({} as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.verifyAccount({ email: "a@b.com", code: "123456" } as never);
        });

        expect(authApi.verifyAccount).toHaveBeenCalled();
    });

    it("resendVerification delegates to authApi.resendVerification", async () => {
        vi.mocked(authApi.resendVerification).mockResolvedValue(undefined as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.resendVerification("a@b.com");
        });

        expect(authApi.resendVerification).toHaveBeenCalledWith("a@b.com");
    });

    it("forgotPassword delegates to authApi.forgotPassword", async () => {
        vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.forgotPassword("a@b.com");
        });

        expect(authApi.forgotPassword).toHaveBeenCalledWith("a@b.com");
    });

    it("resetPassword delegates to authApi.resetPassword", async () => {
        vi.mocked(authApi.resetPassword).mockResolvedValue(undefined as never);
        const { result } = renderHook(() => useAuthActions());

        await act(async () => {
            await result.current.resetPassword("tok", "n1", "n1");
        });

        expect(authApi.resetPassword).toHaveBeenCalledWith("tok", "n1", "n1");
    });
});
