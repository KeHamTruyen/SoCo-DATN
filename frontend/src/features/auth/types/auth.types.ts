import type { ShopInformationSnapshot } from "../../seller/types/shopInformation.types";

export interface UserProfile {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    coverImage?: string;
    role?: "buyer" | "seller";
    /** Public shop metadata (set when seller registration completes). */
    shopInformation?: ShopInformationSnapshot | null;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user: UserProfile;
    requires2FA?: boolean;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
}

/** Returned by /auth/register — not a full AuthResponse */
export interface RegisterResponse {
    message: string;
    tempToken: string;
}

export interface VerifyOtpPayload {
    otpCode: string;
    tempToken: string;
}

export interface ResendVerificationResponse {
    message: string;
    tempToken?: string;
}
