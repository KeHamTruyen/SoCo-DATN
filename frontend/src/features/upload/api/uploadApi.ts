import { getAccessToken } from "../../../shared/auth/tokenStorage";

const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
    "http://localhost:5000/api";

async function parseJsonSafe(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export type UploadImageResult = { url: string; publicId: string };

async function postImage(
    path: "shop-logo" | "shop-cover" | "seller-id-doc",
    file: File,
): Promise<UploadImageResult> {
    const token = getAccessToken();
    if (!token) {
        throw new Error("Not authenticated");
    }
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${API_BASE_URL}/upload/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        credentials: "include",
    });
    const body = await parseJsonSafe(res);
    if (!res.ok) {
        const msg =
            (body?.message as string | undefined) ?? `Upload failed (${res.status})`;
        throw new Error(msg);
    }
    const data = body?.data as { url?: string; publicId?: string } | undefined;
    if (!data?.url) {
        throw new Error("Invalid upload response");
    }
    return { url: data.url, publicId: data.publicId ?? "" };
}

export const uploadApi = {
    uploadShopLogo: (file: File) => postImage("shop-logo", file),
    uploadShopCover: (file: File) => postImage("shop-cover", file),
    /** Seller step 2 — CMND/CCCD/passport (call twice for front + back). */
    uploadSellerIdDoc: (file: File) => postImage("seller-id-doc", file),
};
