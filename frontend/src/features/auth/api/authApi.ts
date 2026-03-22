import { httpClient } from "../../../shared/api/httpClient";
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    RegisterResponse,
    ResendVerificationResponse,
    UserProfile,
    VerifyOtpPayload,
} from "../types/auth.types";

interface ApiResponse<T> {
    data?: T;
    message?: string;
}

function unwrap<T>(response: ApiResponse<T> | T): T {
    if (
        typeof response === "object" &&
        response !== null &&
        "data" in response
    ) {
        return (response as ApiResponse<T>).data as T;
    }
    return response as T;
}

export const authApi = {
    async login(payload: LoginPayload) {
        const res = await httpClient.post<
            ApiResponse<AuthResponse> | AuthResponse
        >("/auth/login", payload);
        return unwrap<AuthResponse>(res);
    },
    async register(payload: RegisterPayload) {
        const res = await httpClient.post<
            ApiResponse<RegisterResponse> | RegisterResponse
        >("/auth/register", payload);
        return unwrap<RegisterResponse>(res);
    },
    async verify2fa(payload: VerifyOtpPayload) {
        const res = await httpClient.post<
            ApiResponse<AuthResponse> | AuthResponse
        >("/auth/verify-2fa", payload);
        return unwrap<AuthResponse>(res);
    },
    async verifyAccount(payload: VerifyOtpPayload) {
        const res = await httpClient.post<
            ApiResponse<AuthResponse> | AuthResponse
        >("/auth/verify-email", payload);
        return unwrap<AuthResponse>(res);
    },
    async resendVerification(email: string) {
        const res = await httpClient.post<
            ApiResponse<ResendVerificationResponse> | ResendVerificationResponse
        >("/auth/resend-verification", { email });
        return unwrap<ResendVerificationResponse>(res);
    },
    async forgotPassword(email: string) {
        return httpClient.post("/auth/forgot-password", { email });
    },
    async resetPassword(
        token: string,
        newPassword: string,
        confirmPassword: string,
    ) {
        return httpClient.post("/auth/reset-password", {
            token,
            newPassword,
            confirmPassword,
        });
    },
    async me() {
        const res = await httpClient.get<
            ApiResponse<UserProfile> | UserProfile
        >("/auth/me", { requiresAuth: true });
        return unwrap<UserProfile>(res);
    },
    async logout() {
        return httpClient.post("/auth/logout", {}, { requiresAuth: true });
    },
};
