import { httpClient } from "../../../shared/api/httpClient";
import type {
    AuthResponse,
    LoginPayload,
    PrivacySettings,
    PrivacySettingsPatch,
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
    /** Backend: `{ success, data: { user } }` — unwrap yields `{ user }`, not a flat profile. */
    async me() {
        const res = await httpClient.get<
            ApiResponse<{ user: UserProfile }> | { user: UserProfile }
        >("/auth/me", { requiresAuth: true });
        const data = unwrap<{ user: UserProfile }>(res);
        return data.user;
    },
    async logout() {
        return httpClient.post("/auth/logout", {}, { requiresAuth: true });
    },

    async getPrivacy() {
        const res = await httpClient.get<
            ApiResponse<PrivacySettings> | { success?: boolean; data?: PrivacySettings }
        >("/auth/privacy", { requiresAuth: true });
        return unwrap<PrivacySettings>(res as ApiResponse<PrivacySettings>);
    },

    async updatePrivacy(payload: PrivacySettingsPatch) {
        const res = await httpClient.put<
            ApiResponse<PrivacySettings> | { success?: boolean; data?: PrivacySettings }
        >("/auth/privacy", payload, { requiresAuth: true });
        return unwrap<PrivacySettings>(res as ApiResponse<PrivacySettings>);
    },

    // ─── 2FA ────────────────────────────────────────────────────

    async get2FAStatus() {
        const res = await httpClient.get<
            ApiResponse<{ isEnabled: boolean }> | { isEnabled: boolean }
        >("/auth/2fa/status", { requiresAuth: true });
        return unwrap<{ isEnabled: boolean }>(res);
    },

    async enable2FA() {
        const res = await httpClient.post<
            ApiResponse<{ message: string; backupCodes: string[] }> | { message: string; backupCodes: string[] }
        >("/auth/2fa/enable", {}, { requiresAuth: true });
        return unwrap<{ message: string; backupCodes: string[] }>(res);
    },

    async confirm2FAEnable(otpCode: string) {
        const res = await httpClient.post<
            ApiResponse<{ message: string; backupCodes: string[] }> | { message: string; backupCodes: string[] }
        >("/auth/2fa/confirm", { otpCode }, { requiresAuth: true });
        return unwrap<{ message: string; backupCodes: string[] }>(res);
    },

    async disable2FA(password: string) {
        const res = await httpClient.post<
            ApiResponse<{ message: string }> | { message: string }
        >("/auth/2fa/disable", { password }, { requiresAuth: true });
        return unwrap<{ message: string }>(res);
    },
};
