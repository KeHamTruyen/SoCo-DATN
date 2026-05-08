import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, setHours, setMinutes, setSeconds, startOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { searchUsers } from "../../auth/api/userApi";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { uploadApi } from "../../upload/api/uploadApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import {
    isPostBodyHtmlEmpty,
    plainOrLegacyToPostHtml,
    sanitizePostHtml,
} from "../../../shared/tiptap/postHtmlUtils";
import type { CreatePostPayload, PostMediaType, PostVisibility, TaggedUserBrief } from "../types/feed.types";
import { mediaTypeFromFile, parsePostVisibility, toDatetimeLocalValue } from "../utils/createPostUtils";

export interface CreatePostInitialValues extends Partial<CreatePostPayload> {
    productLabel?: string | null;
    productLabels?: string[];
    taggedUsers?: TaggedUserBrief[];
}

export type ToolPanel = "none" | "product" | "friends" | "feeling" | "location";

export interface UseCreatePostFormStateOptions {
    onClose: () => void;
    onCreate: (payload: CreatePostPayload) => Promise<void>;
    defaultScheduleMode?: boolean;
    groupId?: string;
    initialValues?: CreatePostInitialValues;
    hideScheduleOption?: boolean;
}

export function useCreatePostFormState({
    onClose,
    onCreate,
    defaultScheduleMode = false,
    groupId,
    initialValues,
    hideScheduleOption = false,
}: UseCreatePostFormStateOptions) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthSession();

    const initialScheduledDate = useMemo(() => {
        if (!initialValues?.scheduledAt) return undefined;
        const parsed = new Date(initialValues.scheduledAt);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }, [initialValues?.scheduledAt]);

    const initialScheduleMode = !hideScheduleOption && (defaultScheduleMode || Boolean(initialScheduledDate));

    const [content, setContent] = useState(() => plainOrLegacyToPostHtml(initialValues?.content ?? ""));
    const [visibility, setVisibility] = useState<PostVisibility>(() =>
        parsePostVisibility(initialValues?.visibility),
    );
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() =>
        initialScheduleMode ? (initialScheduledDate ?? new Date()) : undefined,
    );
    const [scheduleTime, setScheduleTime] = useState(() =>
        initialScheduledDate ? format(initialScheduledDate, "HH:mm") : format(new Date(), "HH:mm"),
    );
    const [isScheduleMode, setIsScheduleMode] = useState(initialScheduleMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const schedulePanelRef = useRef<HTMLDivElement>(null);

    const [mediaUrls, setMediaUrls] = useState<string[]>(() => initialValues?.mediaUrls ?? []);
    const [mediaType, setMediaType] = useState<PostMediaType | undefined>(() => initialValues?.mediaType);
    const [uploadBusy, setUploadBusy] = useState(false);
    const [productLabel, setProductLabel] = useState<string | null>(initialValues?.productLabel ?? null);
    const [productTags, setProductTags] = useState<CreatePostPayload["productTags"]>(
        initialValues?.productTags ?? [],
    );
    const [productTagAnchorType, setProductTagAnchorType] = useState<
        "MEDIA_HOTSPOT" | "INLINE_TEXT" | "CONTENT_BLOCK"
    >("MEDIA_HOTSPOT");
    const [taggedUsers, setTaggedUsers] = useState<TaggedUserBrief[]>(() => initialValues?.taggedUsers ?? []);
    const [feeling, setFeeling] = useState<string | null>(initialValues?.feeling ?? null);
    const [location, setLocation] = useState(initialValues?.location ?? "");
    const [toolPanel, setToolPanel] = useState<ToolPanel>("none");

    const FEELING_PRESETS = useMemo(
        () => [
            { emoji: "😊", label: t("createPost.feelings.happy"), value: t("createPost.feelings.happyVal") },
            { emoji: "🥰", label: t("createPost.feelings.grateful"), value: t("createPost.feelings.gratefulVal") },
            { emoji: "😎", label: t("createPost.feelings.cool"), value: t("createPost.feelings.coolVal") },
            { emoji: "🤩", label: t("createPost.feelings.excited"), value: t("createPost.feelings.excitedVal") },
            { emoji: "😌", label: t("createPost.feelings.relaxed"), value: t("createPost.feelings.relaxedVal") },
            { emoji: "💪", label: t("createPost.feelings.energetic"), value: t("createPost.feelings.energeticVal") },
            { emoji: "❤️", label: t("createPost.feelings.loved"), value: t("createPost.feelings.lovedVal") },
            { emoji: "🎉", label: t("createPost.feelings.celebrating"), value: t("createPost.feelings.celebratingVal") },
            { emoji: "☕", label: t("createPost.feelings.coffee"), value: t("createPost.feelings.coffeeVal") },
            { emoji: "✈️", label: t("createPost.feelings.traveling"), value: t("createPost.feelings.travelingVal") },
            { emoji: "📦", label: t("createPost.feelings.shopping"), value: t("createPost.feelings.shoppingVal") },
            { emoji: "🛍️", label: t("createPost.feelings.sale"), value: t("createPost.feelings.saleVal") },
        ],
        [t],
    );

    const [productQuery, setProductQuery] = useState("");
    const [productHits, setProductHits] = useState<ProductListItem[]>([]);
    const [productSearching, setProductSearching] = useState(false);
    const [friendQuery, setFriendQuery] = useState("");
    const [friendHits, setFriendHits] = useState<TaggedUserBrief[]>([]);
    const [friendSearching, setFriendSearching] = useState(false);
    const mediaUrlsRef = useRef(mediaUrls);
    mediaUrlsRef.current = mediaUrls;

    const scheduledAt = useMemo(
        () => (isScheduleMode ? toDatetimeLocalValue(scheduleDate, scheduleTime) : ""),
        [isScheduleMode, scheduleDate, scheduleTime],
    );

    const togglePanel = useCallback((p: ToolPanel) => {
        setToolPanel((cur) => (cur === p ? "none" : p));
    }, []);

    useEffect(() => {
        if (toolPanel !== "product" || productQuery.trim().length < 2) {
            setProductHits([]);
            return;
        }
        const timer = setTimeout(() => {
            setProductSearching(true);
            void marketplaceApi
                .listProducts({ q: productQuery.trim(), page: 1, pageSize: 8 })
                .then((r) => setProductHits(r.items))
                .catch(() => setProductHits([]))
                .finally(() => setProductSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [productQuery, toolPanel]);

    useEffect(() => {
        if (toolPanel !== "friends" || friendQuery.trim().length < 1) {
            setFriendHits([]);
            return;
        }
        const timer = setTimeout(() => {
            setFriendSearching(true);
            void searchUsers(friendQuery.trim(), 12)
                .then(setFriendHits)
                .catch(() => setFriendHits([]))
                .finally(() => setFriendSearching(false));
        }, 280);
        return () => clearTimeout(timer);
    }, [friendQuery, toolPanel]);

    const canSubmit =
        (!isPostBodyHtmlEmpty(content) || mediaUrls.length > 0) &&
        (!isScheduleMode || Boolean(scheduledAt)) &&
        !isSubmitting &&
        !uploadBusy;

    const appendMedia = async (files: FileList | null) => {
        if (!files?.length) return;
        const room = Math.max(0, 10 - mediaUrlsRef.current.length);
        const slice = Array.from(files).slice(0, room);
        if (!slice.length) return;
        setUploadBusy(true);
        try {
            const added: string[] = [];
            let nextType: PostMediaType | undefined;
            for (const file of slice) {
                const { url } = await uploadApi.uploadPostMedia(file);
                added.push(url);
                if (!nextType) nextType = mediaTypeFromFile(file);
            }
            if (added.length) {
                setMediaUrls((prev) => [...prev, ...added]);
                setMediaType((mt) => mt ?? nextType ?? "IMAGE");
            }
        } finally {
            setUploadBusy(false);
        }
    };

    const removeMediaAt = (index: number) => {
        setMediaUrls((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length === 0) setMediaType(undefined);
            return next;
        });
    };

    const addTaggedUser = (u: TaggedUserBrief) => {
        if (taggedUsers.length >= 10 || taggedUsers.some((x) => x.id === u.id)) return;
        if (u.id === user?.id) return;
        setTaggedUsers((prev) => [...prev, u]);
    };

    const removeTaggedUser = (id: string) => {
        setTaggedUsers((prev) => prev.filter((x) => x.id !== id));
    };

    const addProductTag = (product: ProductListItem) => {
        setProductTags((prev) => {
            if (prev?.some((tag) => tag.productId === product.id)) return prev;
            const nextTag = {
                productId: product.id,
                anchorType: productTagAnchorType,
                positionX: 50,
                positionY: 50,
                blockId: productTagAnchorType === "CONTENT_BLOCK" ? "body-main" : undefined,
                sortOrder: prev?.length ?? 0,
            };
            return [...(prev ?? []), nextTag];
        });
    };

    const removeProductTag = (productIdToRemove: string) => {
        setProductTags((prev) => (prev ?? []).filter((tag) => tag.productId !== productIdToRemove));
    };

    const fillLocationFromGeo = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            },
            () => {},
            { maximumAge: 60_000, timeout: 10_000 },
        );
    };

    const handlePost = async () => {
        if (isPostBodyHtmlEmpty(content) && mediaUrls.length === 0) return;
        if (isScheduleMode && !scheduledAt) return;
        setIsSubmitting(true);
        try {
            const bodyHtml = isPostBodyHtmlEmpty(content) ? "" : sanitizePostHtml(content);
            const payload: CreatePostPayload = {
                content: bodyHtml,
                mediaUrls: mediaUrls.length ? mediaUrls : undefined,
                mediaType: mediaUrls.length ? mediaType : undefined,
                productTags: productTags?.length ? productTags : undefined,
                location: location.trim() || undefined,
                feeling: feeling || undefined,
                taggedUserIds: taggedUsers.length ? taggedUsers.map((x) => x.id) : undefined,
                scheduledAt: isScheduleMode ? scheduledAt : undefined,
                groupId: groupId || undefined,
                visibility: groupId ? "PUBLIC" : visibility,
            };
            await onCreate(payload);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAiCreativeLab = () => {
        onClose();
        navigate("/ai-creative-lab");
    };

    const toggleSchedule = () => {
        if (isScheduleMode) {
            setIsScheduleMode(false);
            setScheduleDate(undefined);
            setScheduleTime(format(new Date(), "HH:mm"));
            return;
        }
        setScheduleDate((d) => d ?? new Date());
        setIsScheduleMode(true);
        requestAnimationFrame(() => {
            schedulePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    };

    const rdpThemeStyle = {
        "--rdp-accent-color": "var(--primary)",
        "--rdp-accent-background-color": "var(--primary-subtle)",
        "--rdp-day_button-border-radius": "var(--radius)",
        "--rdp-today-color": "var(--primary)",
        "--rdp-nav_button-height": "2.25rem",
        "--rdp-nav_button-width": "2.25rem",
    } as CSSProperties;

    const displayName = user?.fullName?.trim() || user?.username || "—";

    return {
        t,
        user,
        content,
        setContent,
        visibility,
        setVisibility,
        scheduleDate,
        setScheduleDate,
        scheduleTime,
        setScheduleTime,
        isScheduleMode,
        setIsScheduleMode,
        isSubmitting,
        fileInputRef,
        schedulePanelRef,
        mediaUrls,
        mediaType,
        uploadBusy,
        productLabel,
        setProductLabel,
        productTags,
        setProductTags,
        productTagAnchorType,
        setProductTagAnchorType,
        taggedUsers,
        feeling,
        setFeeling,
        location,
        setLocation,
        toolPanel,
        setToolPanel,
        FEELING_PRESETS,
        productQuery,
        setProductQuery,
        productHits,
        productSearching,
        friendQuery,
        setFriendQuery,
        friendHits,
        setFriendHits,
        friendSearching,
        scheduledAt,
        togglePanel,
        canSubmit,
        appendMedia,
        removeMediaAt,
        addTaggedUser,
        removeTaggedUser,
        addProductTag,
        removeProductTag,
        fillLocationFromGeo,
        handlePost,
        openAiCreativeLab,
        toggleSchedule,
        rdpThemeStyle,
        displayName,
        groupId,
        hideScheduleOption,
    };
}
