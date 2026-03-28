import {
    CalendarClock,
    ChevronRight,
    ImagePlus,
    Loader2,
    MapPin,
    Smile,
    Tag,
    Users,
    Wand2,
    X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, setHours, setMinutes, setSeconds, startOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-day-picker/style.css";

import { searchUsers } from "../../auth/api/userApi";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { uploadApi } from "../../upload/api/uploadApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import type { CreatePostPayload, PostMediaType, TaggedUserBrief } from "../types/feed.types";
import { useTranslation } from "react-i18next";

interface CreatePostModalProps {
    onClose: () => void;
    onCreate: (payload: CreatePostPayload) => Promise<void>;
    /** Open with schedule picker expanded (e.g. on /scheduled-posts). */
    defaultScheduleMode?: boolean;
    /** When set, the post is created inside a group. */
    groupId?: string;
}

function toDatetimeLocalValue(date: Date | undefined, timeStr: string): string {
    if (!date) return "";
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] ?? "", 10);
    const m = parseInt(parts[1] ?? "", 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return "";
    const d = setSeconds(setMinutes(setHours(date, h), m), 0);
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

const FEATURE_CARD_CLASS =
    "group relative flex flex-col gap-2 rounded-xl border border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:from-primary/20 dark:via-primary/10";
const FEATURE_ICON_CLASS =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25";

type ToolPanel = "none" | "product" | "friends" | "feeling" | "location";

function mediaTypeFromFile(file: File): PostMediaType {
    if (file.type.startsWith("video/")) return "VIDEO";
    return "IMAGE";
}

export function CreatePostModal({
    onClose,
    onCreate,
    defaultScheduleMode = false,
    groupId,
}: CreatePostModalProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const [content, setContent] = useState("");
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() =>
        defaultScheduleMode ? new Date() : undefined,
    );
    const [scheduleTime, setScheduleTime] = useState(() => format(new Date(), "HH:mm"));
    const [isScheduleMode, setIsScheduleMode] = useState(defaultScheduleMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const schedulePanelRef = useRef<HTMLDivElement>(null);

    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [mediaType, setMediaType] = useState<PostMediaType | undefined>(undefined);
    const [uploadBusy, setUploadBusy] = useState(false);
    const [productId, setProductId] = useState<string | null>(null);
    const [productLabel, setProductLabel] = useState<string | null>(null);
    const [taggedUsers, setTaggedUsers] = useState<TaggedUserBrief[]>([]);
    const [feeling, setFeeling] = useState<string | null>(null);
    const [location, setLocation] = useState("");
    const [toolPanel, setToolPanel] = useState<ToolPanel>("none");

    const FEELING_PRESETS = useMemo(() => [
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
    ], [t]);

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

    const togglePanel = (p: ToolPanel) => {
        setToolPanel((cur) => (cur === p ? "none" : p));
    };

    useEffect(() => {
        if (toolPanel !== "product" || productQuery.trim().length < 2) {
            setProductHits([]);
            return;
        }
        const t = setTimeout(() => {
            setProductSearching(true);
            void marketplaceApi
                .listProducts({ q: productQuery.trim(), page: 1, pageSize: 8 })
                .then((r) => setProductHits(r.items))
                .catch(() => setProductHits([]))
                .finally(() => setProductSearching(false));
        }, 300);
        return () => clearTimeout(t);
    }, [productQuery, toolPanel]);

    useEffect(() => {
        if (toolPanel !== "friends" || friendQuery.trim().length < 1) {
            setFriendHits([]);
            return;
        }
        const t = setTimeout(() => {
            setFriendSearching(true);
            void searchUsers(friendQuery.trim(), 12)
                .then(setFriendHits)
                .catch(() => setFriendHits([]))
                .finally(() => setFriendSearching(false));
        }, 280);
        return () => clearTimeout(t);
    }, [friendQuery, toolPanel]);

    const canSubmit =
        (Boolean(content.trim()) || mediaUrls.length > 0) &&
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
                setMediaType((t) => t ?? nextType ?? "IMAGE");
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
        if (taggedUsers.length >= 10 || taggedUsers.some((t) => t.id === u.id)) return;
        if (u.id === user?.id) return;
        setTaggedUsers((prev) => [...prev, u]);
    };

    const removeTaggedUser = (id: string) => {
        setTaggedUsers((prev) => prev.filter((t) => t.id !== id));
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
        if (!content.trim() && mediaUrls.length === 0) return;
        if (isScheduleMode && !scheduledAt) return;
        setIsSubmitting(true);
        try {
            const payload: CreatePostPayload = {
                content: content.trim(),
                mediaUrls: mediaUrls.length ? mediaUrls : undefined,
                mediaType: mediaUrls.length ? mediaType : undefined,
                productId: productId || undefined,
                location: location.trim() || undefined,
                feeling: feeling || undefined,
                taggedUserIds: taggedUsers.length ? taggedUsers.map((t) => t.id) : undefined,
                scheduledAt: isScheduleMode ? scheduledAt : undefined,
                groupId: groupId || undefined,
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

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-background-light shadow-2xl dark:border-neutral-800 dark:bg-background-dark sm:rounded-xl">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">{t("createPost.title")}</h2>
                    <Button
                        size="sm"
                        className="rounded-full px-5"
                        onClick={() => void handlePost()}
                        disabled={!canSubmit}
                    >
                        {isScheduleMode ? t("createPost.schedule") : t("createPost.post")}
                    </Button>
                </div>

                <div className="overflow-y-auto">
                    <div className="flex gap-3 px-4 py-4">
                        <Avatar
                            src={user?.avatarUrl}
                            alt={user?.fullName ?? "You"}
                            wrapperClassName="h-10 w-10 shrink-0"
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t("createPost.placeholder")}
                            rows={4}
                            className="flex-1 resize-none border-none bg-transparent p-0 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:placeholder:text-neutral-500"
                        />
                    </div>

                    {mediaUrls.length > 0 ? (
                        <div className="flex flex-wrap gap-2 px-4 pb-2">
                            {mediaUrls.map((url, i) => (
                                <div
                                    key={`${url}-${i}`}
                                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted"
                                >
                                    {mediaType === "VIDEO" ? (
                                        <video
                                            src={url}
                                            className="h-full w-full object-cover"
                                            muted
                                            playsInline
                                        />
                                    ) : (
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeMediaAt(i)}
                                        className="absolute right-0.5 top-0.5 rounded-full bg-neutral-900/70 p-0.5 text-white"
                                        aria-label="Remove media"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {(productLabel || taggedUsers.length > 0 || feeling || location.trim()) && (
                        <div className="flex flex-wrap gap-2 px-4 pb-2 text-xs">
                            {productLabel ? (
                                <span className="rounded-full bg-success/15 px-2 py-1 font-medium text-success">
                                    {t("createPost.productLabel")}: {productLabel}
                                </span>
                            ) : null}
                            {taggedUsers.map((t) => (
                                <span
                                    key={t.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 font-medium text-primary"
                                >
                                    @{t.username ?? t.fullName}
                                    <button
                                        type="button"
                                        className="ml-0.5 rounded-full hover:bg-primary/20"
                                        onClick={() => removeTaggedUser(t.id)}
                                        aria-label="Remove tag"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            {feeling ? (
                                <span className="rounded-full bg-muted px-2 py-1 font-medium">
                                    {feeling}
                                </span>
                            ) : null}
                            {location.trim() ? (
                                <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                                    📍 {location.trim()}
                                </span>
                            ) : null}
                        </div>
                    )}

                    <div className="px-4 pb-4">
                        <div
                            role="toolbar"
                            aria-label={t("createPost.addToPost")}
                            className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 dark:bg-muted/20"
                        >
                            <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                {t("createPost.addToPost")}
                            </span>
                            <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    aria-hidden
                                    onChange={(e) => {
                                        void appendMedia(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadBusy || mediaUrls.length >= 10}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    aria-label="Add photos or videos"
                                >
                                    {uploadBusy ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ImagePlus className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePanel("product")}
                                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "product" ? "ring-2 ring-primary/30" : ""}`}
                                    aria-label={t("createPost.tagProducts")}
                                >
                                    <Tag className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePanel("friends")}
                                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "friends" ? "ring-2 ring-primary/30" : ""}`}
                                    aria-label={t("createPost.tagFriends")}
                                >
                                    <Users className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePanel("feeling")}
                                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "feeling" ? "ring-2 ring-primary/30" : ""}`}
                                    aria-label={t("createPost.feelingActivity")}
                                >
                                    <Smile className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePanel("location")}
                                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "location" ? "ring-2 ring-primary/30" : ""}`}
                                    aria-label={t("createPost.location")}
                                >
                                    <MapPin className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {toolPanel === "product" ? (
                            <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                                <p className="text-sm font-semibold text-foreground">{t("createPost.tagProducts")}</p>
                                <input
                                    value={productQuery}
                                    onChange={(e) => setProductQuery(e.target.value)}
                                    placeholder={t("createPost.searchProduct")}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                                />
                                {productSearching ? (
                                    <p className="text-xs text-muted-foreground">{t("createPost.searching")}</p>
                                ) : null}
                                <ul className="max-h-40 space-y-1 overflow-y-auto">
                                    {productHits.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                type="button"
                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                                                onClick={() => {
                                                    setProductId(p.id);
                                                    setProductLabel(p.name);
                                                    setToolPanel("none");
                                                }}
                                            >
                                                {p.imageUrl ? (
                                                    <img
                                                        src={p.imageUrl}
                                                        alt=""
                                                        className="h-9 w-9 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-md bg-muted" />
                                                )}
                                                <span className="line-clamp-1 font-medium">{p.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {productId ? (
                                    <button
                                        type="button"
                                        className="text-xs font-medium text-primary hover:underline"
                                        onClick={() => {
                                            setProductId(null);
                                            setProductLabel(null);
                                        }}
                                    >
                                        {t("createPost.removeProduct")}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        {toolPanel === "friends" ? (
                            <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                                <p className="text-sm font-semibold text-foreground">{t("createPost.tagFriends")}</p>
                                <input
                                    value={friendQuery}
                                    onChange={(e) => setFriendQuery(e.target.value)}
                                    placeholder={t("createPost.searchFriend")}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                                />
                                {friendSearching ? (
                                    <p className="text-xs text-muted-foreground">{t("createPost.searching")}</p>
                                ) : null}
                                <ul className="max-h-40 space-y-1 overflow-y-auto">
                                    {friendHits.map((u) => (
                                        <li key={u.id}>
                                            <button
                                                type="button"
                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                                                onClick={() => {
                                                    addTaggedUser(u);
                                                    setFriendQuery("");
                                                    setFriendHits([]);
                                                }}
                                            >
                                                <Avatar
                                                    src={u.avatarUrl}
                                                    alt={u.fullName ?? u.username ?? ""}
                                                    wrapperClassName="h-8 w-8 shrink-0"
                                                />
                                                <span className="font-medium">
                                                    {u.fullName ?? u.username}
                                                </span>
                                                {u.username ? (
                                                    <span className="text-muted-foreground">
                                                        @{u.username}
                                                    </span>
                                                ) : null}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {toolPanel === "feeling" ? (
                            <div className="mt-3 rounded-xl border border-border bg-card p-3">
                                <p className="mb-2 text-sm font-semibold text-foreground">{t("createPost.feelingActivity")}</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {FEELING_PRESETS.map((f) => (
                                        <button
                                            key={f.value}
                                            type="button"
                                            className={`rounded-lg border px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${feeling === f.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
                                            onClick={() => {
                                                setFeeling(f.value);
                                                setToolPanel("none");
                                            }}
                                        >
                                            <span className="mr-1">{f.emoji}</span>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                {feeling ? (
                                    <button
                                        type="button"
                                        className="mt-2 text-xs font-medium text-primary hover:underline"
                                        onClick={() => setFeeling(null)}
                                    >
                                        {t("createPost.removeFeeling")}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        {toolPanel === "location" ? (
                            <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                                <p className="text-sm font-semibold text-foreground">{t("createPost.location")}</p>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={t("createPost.searchLocation")}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                                />
                                <button
                                    type="button"
                                    className="text-xs font-medium text-primary hover:underline"
                                    onClick={() => fillLocationFromGeo()}
                                >
                                    {t("createPost.useGPS")}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-3 px-4 pb-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={openAiCreativeLab}
                            className={FEATURE_CARD_CLASS}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className={FEATURE_ICON_CLASS}>
                                    <Wand2 className="h-5 w-5" />
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-primary opacity-70 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{t("createPost.aiCreativeLab")}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t("createPost.aiCreativeLabDesc")}
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={toggleSchedule}
                            className={`${FEATURE_CARD_CLASS} ${isScheduleMode ? "ring-2 ring-primary/40" : ""}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className={FEATURE_ICON_CLASS}>
                                    <CalendarClock className="h-5 w-5" />
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-primary opacity-70 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{t("createPost.schedulePost")}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t("createPost.schedulePostDesc")}
                                </p>
                            </div>
                        </button>
                    </div>

                    {isScheduleMode ? (
                        <div ref={schedulePanelRef} className="space-y-3 px-4 py-3">
                            <label className="block text-center text-sm font-semibold text-foreground">
                                {t("createPost.scheduleDateTime")}
                            </label>
                            <div className="flex w-full justify-center">
                                <div className="inline-flex max-w-full rounded-xl border border-border bg-card p-3 text-card-foreground">
                                    <DayPicker
                                        mode="single"
                                        required={false}
                                        selected={scheduleDate}
                                        onSelect={setScheduleDate}
                                        disabled={{ before: startOfDay(new Date()) }}
                                        style={rdpThemeStyle}
                                        className="mx-auto text-foreground [--rdp-weekday-opacity:1] [&_.rdp-weekday]:text-muted-foreground [&_.rdp-outside]:opacity-60 [&_.rdp-outside]:text-muted-foreground [&_.rdp-month_caption]:text-foreground [&_.rdp-caption_label]:text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                                <label
                                    htmlFor="create-post-schedule-time"
                                    className="shrink-0 text-sm font-medium text-foreground"
                                >
                                    {t("createPost.time")}
                                </label>
                                <input
                                    id="create-post-schedule-time"
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-48"
                                />
                            </div>
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    className="text-xs font-medium text-primary hover:underline"
                                    onClick={() => {
                                        setIsScheduleMode(false);
                                        setScheduleDate(undefined);
                                        setScheduleTime(format(new Date(), "HH:mm"));
                                    }}
                                >
                                    {t("createPost.postNowInstead")}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
