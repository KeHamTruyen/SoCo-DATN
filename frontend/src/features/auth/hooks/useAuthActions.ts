import { useCallback } from "react";
import { authApi } from "../api/authApi";
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    VerifyOtpPayload,
} from "../types/auth.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";

export function useAuthActions() {
    const { completeAuth } = useAuthSession();

    const completeLogin = useCallback(
        (payload: AuthResponse) => {
            completeAuth(payload);
        },
        [completeAuth],
    );

    const login = useCallback((payload: LoginPayload) => authApi.login(payload), []);
    const register = useCallback(
        (payload: RegisterPayload) => authApi.register(payload),
        [],
    );
    const verify2fa = useCallback((payload: VerifyOtpPayload) => authApi.verify2fa(payload), []);
    const verifyAccount = useCallback(
        (payload: VerifyOtpPayload) => authApi.verifyAccount(payload),
        [],
    );
    const resendVerification = useCallback(
        (email: string) => authApi.resendVerification(email),
        [],
    );
    const forgotPassword = useCallback(
        (email: string) => authApi.forgotPassword(email),
        [],
    );
    const resetPassword = useCallback(
        (token: string, newPassword: string, confirmPassword: string) =>
            authApi.resetPassword(token, newPassword, confirmPassword),
        [],
    );

    return {
        completeLogin,
        login,
        register,
        verify2fa,
        verifyAccount,
        resendVerification,
        forgotPassword,
        resetPassword,
    };
}

