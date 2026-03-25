import { getAccessToken } from "../../../shared/auth/tokenStorage";
import { httpClient } from "../../../shared/api/httpClient";

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

/** Single product image → POST /upload/product (field `image`). */
export async function uploadProductImage(file: File): Promise<UploadImageResult> {
    const form = new FormData();
    form.append("image", file);
    const body = await httpClient.postFormData<{
        success?: boolean;
        data?: { url?: string; publicId?: string };
    }>("/upload/product", form, { requiresAuth: true });
    const url = body?.data?.url;
    if (!url) {
        throw new Error("Invalid upload response");
    }
    return { url, publicId: body.data?.publicId ?? "" };
}

/** Multiple product images → POST /upload/products (field `images`). */
export async function uploadProductImages(
    files: File[],
): Promise<UploadImageResult[]> {
    if (files.length === 0) return [];
    const form = new FormData();
    for (const f of files) {
        form.append("images", f);
    }
    const res = await httpClient.postFormData<{
        success?: boolean;
        data?: { images?: Array<{ url: string; publicId?: string }> };
    }>("/upload/products", form, { requiresAuth: true });
    const images = res?.data?.images ?? [];
    if (!Array.isArray(images) || images.length === 0) {
        throw new Error("Invalid upload response");
    }
    return images.map((img) => ({
        url: img.url,
        publicId: img.publicId ?? "",
    }));
}

/** Feed post attachment — POST /upload/post (field `media`). */
export async function uploadPostMedia(file: File): Promise<UploadImageResult> {
    const token = getAccessToken();
    if (!token) {
        throw new Error("Not authenticated");
    }
    const form = new FormData();
    form.append("media", file);
    const res = await fetch(`${API_BASE_URL}/upload/post`, {
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
    uploadProductImage,
    uploadProductImages,
    uploadPostMedia,
};
