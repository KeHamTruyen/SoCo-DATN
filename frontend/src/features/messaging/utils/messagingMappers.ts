import i18n from "../../../i18n";
import type { Conversation, Message } from "../types/messaging.types";

interface RawUser {
    id: string;
    username?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
}

/** API / Prisma message shape (REST or Socket) */
export interface RawMessagePayload {
    id: string;
    conversationId: string;
    senderId?: string | null;
    content?: string | null;
    messageType?: string;
    mediaUrl?: string | null;
    createdAt: string;
    product?: {
        id: string;
        title: string;
        price?: unknown;
        description?: string | null;
        images?: Array<{ imageUrl?: string | null }>;
    } | null;
}

interface RawParticipant {
    user?: RawUser | null;
}

interface RawConversationPayload {
    id: string;
    participants?: RawParticipant[];
    lastMessage?: RawMessagePayload | null;
    unreadCount?: number;
    updatedAt?: string;
}

function displayName(u: RawUser): string {
    const name = u.fullName?.trim();
    if (name) return name;
    return u.username?.trim() || "User";
}

export function mapConversationFromApi(
    raw: unknown,
    currentUserId: string,
): Conversation | null {
    if (!raw || typeof raw !== "object") return null;
    const c = raw as RawConversationPayload;
    if (!c.id) return null;

    const participants = c.participants ?? [];
    const other = participants.map((p) => p.user).find((u) => u && u.id !== currentUserId);
    const peer = other ?? participants[0]?.user;
    if (!peer) {
        return {
            id: c.id,
            participantId: "",
            participantName: "Unknown",
            participantAvatarUrl: undefined,
            isOnline: false,
            lastMessage: undefined,
            lastMessageIsOwn: undefined,
            lastMessageAt: undefined,
            unreadCount: c.unreadCount ?? 0,
        };
    }

    const lm = c.lastMessage;
    let lastPreview: string | undefined;
    if (lm) {
        if (lm.messageType === "PRODUCT" || lm.product) {
            lastPreview = lm.product?.title ? `[Product] ${lm.product.title}` : "[Product]";
        } else if (lm.messageType === "IMAGE") {
            lastPreview = i18n.t("messaging.previewPhoto");
        } else {
            lastPreview = lm.content ?? undefined;
        }
    }

    const lastMessageIsOwn =
        lm?.senderId != null && lm.senderId === currentUserId ? true : lm ? false : undefined;

    return {
        id: c.id,
        participantId: peer.id,
        participantName: displayName(peer),
        participantAvatarUrl: peer.avatarUrl ?? undefined,
        isOnline: false,
        lastMessage: lastPreview,
        lastMessageIsOwn,
        lastMessageAt: lm?.createdAt ?? c.updatedAt,
        unreadCount: c.unreadCount ?? 0,
    };
}

export function mapMessageFromApi(raw: unknown): Message | null {
    if (!raw || typeof raw !== "object") return null;
    const m = raw as RawMessagePayload;
    if (!m.id || !m.conversationId) return null;

    const isProduct = m.messageType === "PRODUCT" || Boolean(m.product);
    const isImage = m.messageType === "IMAGE";

    let type: Message["type"];
    let mediaUrl: string | undefined;
    let product: Message["product"];

    if (isProduct && m.product) {
        type = "product";
        const img = m.product.images?.[0]?.imageUrl;
        const priceNum =
            m.product.price != null ? Number(m.product.price) : 0;
        product = {
            id: m.product.id,
            name: m.product.title,
            price: Number.isFinite(priceNum) ? priceNum : 0,
            imageUrl: img ?? undefined,
            description: m.product.description ?? undefined,
        };
    } else if (isImage) {
        type = "image";
        mediaUrl = m.mediaUrl ?? undefined;
    } else {
        type = "text";
    }

    return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId ?? "",
        content: m.content ?? "",
        createdAt: m.createdAt,
        type,
        mediaUrl,
        product,
    };
}
