import {
    BarChart3,
    Calendar,
    CalendarClock,
    CheckCircle,
    FolderOpen,
    Loader2,
    Megaphone,
    RefreshCw,
    Search,
    Sparkles,
    Wand2,
    X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import "react-day-picker/style.css";

import { feedApi } from "../features/feed/api/feedApi";
import type { CreatePostPayload, PostMediaType } from "../features/feed/types/feed.types";
import { uploadApi } from "../features/upload/api/uploadApi";
import { AiLabRichOutput } from "../features/ai/components/AiLabRichOutput";
import { aiApi } from "../features/ai/api/aiApi";
import { httpClient } from "../shared/api/httpClient";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { isSellerRole } from "../shared/auth/roleGuards";
import { Button, UnifiedHeader } from "../shared/ui";
import { cn } from "../shared/lib/cn";
import {
    isPostBodyHtmlEmpty,
    plainOrLegacyToPostHtml,
    sanitizePostHtml,
} from "../shared/tiptap/postHtmlUtils";
import {
    AI_LAB_LENGTHS,
    AI_LAB_TONES,
    aiLabToDatetimeLocalValue,
    base64ToFile,
    buildPlainTextFromGenerated,
    lengthOptionLabel,
    type StudioMode,
} from "../features/ai/utils/aiCreativeLabUtils";

const TONES = AI_LAB_TONES;
const LENGTHS = AI_LAB_LENGTHS;

export default function AiCreativeLab() {
    const [mode, setMode] = useState<StudioMode>("text");
    const [prompt, setPrompt] = useState("");
    const [toneMode, setToneMode] = useState<"preset" | "custom">("preset");
    const [tonePreset, setTonePreset] = useState<(typeof TONES)[number]>("Excited");
    const [toneCustom, setToneCustom] = useState("");
    const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
    const [withHashtags, setWithHashtags] = useState(true);
    const [withCta, setWithCta] = useState(true);
    const [productQuery, setProductQuery] = useState("");
    const [myProducts, setMyProducts] = useState<
        Array<{
            id: string;
            title: string;
            description?: string;
            price?: number | null;
            imageUrl?: string | null;
        }>
    >([]);
    const [isLoadingMyProducts, setIsLoadingMyProducts] = useState(false);
    const [hasLoadedMyProducts, setHasLoadedMyProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<
        | {
              id: string;
              title: string;
              description?: string;
              price?: number | null;
              imageUrl?: string | null;
          }
        | null
    >(null);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [successModal, setSuccessModal] = useState<"none" | "scheduled" | "published">("none");
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => new Date());
    const [scheduleTime, setScheduleTime] = useState(() => format(new Date(), "HH:mm"));
    const [postActionBusy, setPostActionBusy] = useState(false);
    /** true khi editor có ký tự (không chỉ khoảng trắng) — cập nhật nhẹ, không lưu full text vào state mỗi phím. */
    const [hasDraftText, setHasDraftText] = useState(false);
    const outputPlainTextRef = useRef("");
    const outputHtmlRef = useRef("<p></p>");
    const [outputRevision, setOutputRevision] = useState(0);
    const [editorResetNonce, setEditorResetNonce] = useState(0);
    const schedulePanelRef = useRef<HTMLDivElement>(null);
    const productWrapRef = useRef<HTMLDivElement>(null);

    const { user } = useAuthSession();
    const canLinkProduct = isSellerRole(user?.role);

    const effectiveTone =
        toneMode === "preset" ? tonePreset : toneCustom.trim();
    const displayTone =
        toneMode === "preset" ? tonePreset : toneCustom.trim() || "—";

    const generatedImage = generated?.generatedImage ?? null;

    const textWeightedScore =
        generated?.evaluationScores?.weightedScore ??
        generated?.textScores?.weightedScore;
    const imageWeightedScore = generated?.imageScores?.weightedScore;

    const scheduledAt = useMemo(
        () => aiLabToDatetimeLocalValue(scheduleDate, scheduleTime),
        [scheduleDate, scheduleTime],
    );

    const hasPostableContent = useMemo(() => {
        const textOk = hasDraftText;
        const imageOk = mode === "image" && Boolean(generated?.generatedImage?.data);
        return Boolean(textOk || imageOk);
    }, [generated, mode, hasDraftText]);

    const onEditorPlainTextChange = useCallback((plain: string) => {
        outputPlainTextRef.current = plain;
        const next = plain.trim().length > 0;
        setHasDraftText((prev) => (prev === next ? prev : next));
    }, []);

    const onEditorHtmlChange = useCallback((html: string) => {
        outputHtmlRef.current = html;
    }, []);

    const resetPageState = useCallback(() => {
        setMode("text");
        setPrompt("");
        setToneMode("preset");
        setTonePreset("Excited");
        setToneCustom("");
        setLength("Medium");
        setWithHashtags(true);
        setWithCta(true);
        setProductQuery("");
        setMyProducts([]);
        setHasLoadedMyProducts(false);
        setSelectedProduct(null);
        setProductDropdownOpen(false);
        setGenerated(null);
        setErrorMessage(null);
        setIsGenerating(false);
        setIsLoadingMyProducts(false);
        setScheduleModalOpen(false);
        setScheduleDate(new Date());
        setScheduleTime(format(new Date(), "HH:mm"));
        outputPlainTextRef.current = "";
        outputHtmlRef.current = "<p></p>";
        setHasDraftText(false);
        setOutputRevision(0);
        setEditorResetNonce((n) => n + 1);
    }, []);

    const buildCreatePayload = useCallback(async (): Promise<CreatePostPayload> => {
        const fallbackPlain = generated
            ? buildPlainTextFromGenerated(generated, length, withHashtags, withCta)
            : "";

        let content = "";
        const htmlRaw = outputHtmlRef.current;
        if (htmlRaw && !isPostBodyHtmlEmpty(htmlRaw)) {
            content = sanitizePostHtml(htmlRaw);
        } else {
            const plain = (outputPlainTextRef.current.trim() || fallbackPlain).trim();
            if (plain) {
                content = sanitizePostHtml(plainOrLegacyToPostHtml(plain));
            }
        }

        let mediaUrls: string[] | undefined;
        let mediaType: PostMediaType | undefined;
        if (mode === "image" && generated?.generatedImage?.data) {
            const mime = generated.generatedImage.mimeType || "image/jpeg";
            const ext = mime.includes("png") ? "png" : "jpg";
            const file = base64ToFile(
                String(generated.generatedImage.data),
                mime,
                `ai-generated.${ext}`,
            );
            const { url } = await uploadApi.uploadPostMedia(file);
            mediaUrls = [url];
            mediaType = "IMAGE";
        }

        return {
            content,
            mediaUrls,
            mediaType,
            productId: canLinkProduct ? selectedProduct?.id ?? undefined : undefined,
        };
    }, [
        canLinkProduct,
        generated,
        length,
        mode,
        selectedProduct,
        withCta,
        withHashtags,
    ]);

    const handlePublishNow = useCallback(async () => {
        if (!hasPostableContent || postActionBusy) return;
        setErrorMessage(null);
        setPostActionBusy(true);
        try {
            const payload = await buildCreatePayload();
            if (!payload.content?.trim() && !payload.mediaUrls?.length) {
                setErrorMessage("Không có nội dung để đăng.");
                return;
            }
            await feedApi.createPost(payload);
            resetPageState();
            setSuccessModal("published");
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Đăng bài thất bại.");
        } finally {
            setPostActionBusy(false);
        }
    }, [buildCreatePayload, hasPostableContent, postActionBusy, resetPageState]);

    const handleConfirmSchedule = useCallback(async () => {
        if (!hasPostableContent || postActionBusy) return;
        if (!scheduledAt) {
            setErrorMessage("Chọn ngày và giờ đăng.");
            return;
        }
        const when = new Date(scheduledAt);
        if (when.getTime() <= Date.now()) {
            setErrorMessage("Thời điểm đăng phải ở tương lai.");
            return;
        }
        setErrorMessage(null);
        setPostActionBusy(true);
        try {
            const base = await buildCreatePayload();
            if (!base.content?.trim() && !base.mediaUrls?.length) {
                setErrorMessage("Không có nội dung để lên lịch.");
                return;
            }
            await feedApi.createScheduledPost({ ...base, scheduledAt });
            resetPageState();
            setSuccessModal("scheduled");
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Lên lịch đăng thất bại.");
        } finally {
            setPostActionBusy(false);
        }
    }, [
        buildCreatePayload,
        hasPostableContent,
        postActionBusy,
        resetPageState,
        scheduledAt,
    ]);

    const openScheduleModal = useCallback(() => {
        if (!hasPostableContent) return;
        setScheduleDate((d) => d ?? new Date());
        setScheduleTime(format(new Date(), "HH:mm"));
        setScheduleModalOpen(true);
        requestAnimationFrame(() => {
            schedulePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }, [hasPostableContent]);

    const rdpThemeStyle = {
        "--rdp-accent-color": "var(--primary)",
        "--rdp-accent-background-color": "var(--primary-subtle)",
        "--rdp-day_button-border-radius": "var(--radius)",
        "--rdp-today-color": "var(--primary)",
        "--rdp-nav_button-height": "2.25rem",
        "--rdp-nav_button-width": "2.25rem",
    } as CSSProperties;

    const handleGenerate = useCallback(async () => {
        if (isGenerating) return;
        setErrorMessage(null);

        const idea = prompt.trim();
        const productAttachment =
            canLinkProduct && selectedProduct
                ? [
                      `Linked product: ${selectedProduct.title}`,
                      selectedProduct.description
                          ? `Description: ${selectedProduct.description}`
                          : null,
                      selectedProduct.price != null ? `Price: ${selectedProduct.price}` : null,
                      selectedProduct.imageUrl ? `Image: ${selectedProduct.imageUrl}` : null,
                  ]
                      .filter(Boolean)
                      .join(". ")
                : canLinkProduct && productQuery.trim()
                  ? `Linked product: ${productQuery.trim()}`
                  : "";
        const description = [idea, productAttachment].filter(Boolean).join(". ");

        if (toneMode === "custom" && !effectiveTone) {
            setErrorMessage("Vui lòng nhập tone tùy chỉnh, hoặc chọn tone gợi ý.");
            return;
        }

        if (!description) {
            setErrorMessage("Vui lòng nhập mô tả sản phẩm/ý tưởng trước khi tạo nội dung.");
            return;
        }

        setGenerated(null);
        outputPlainTextRef.current = "";
        outputHtmlRef.current = "<p></p>";
        setHasDraftText(false);
        setEditorResetNonce((n) => n + 1);

        setIsGenerating(true);
        try {
            if (mode === "text") {
                const res = await aiApi.generateText({
                    description,
                    tone: effectiveTone,
                    withHashtags,
                    withCta,
                    length,
                });
                setGenerated(res);
                setOutputRevision((v) => v + 1);
                return;
            }

            if (mode === "image") {
                const res = await aiApi.generateImageText({
                    description,
                    tone: effectiveTone,
                    withHashtags,
                    withCta,
                    length,
                });
                setGenerated(res);
                setOutputRevision((v) => v + 1);
                return;
            }

            const res = await aiApi.generateVideoImagesText({
                description,
                tone: effectiveTone,
                withHashtags,
                withCta,
                length,
            });
            setGenerated(res);
            setOutputRevision((v) => v + 1);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Tạo nội dung thất bại.");
        } finally {
            setIsGenerating(false);
        }
    }, [
        effectiveTone,
        isGenerating,
        mode,
        prompt,
        canLinkProduct,
        productQuery,
        selectedProduct,
        toneMode,
        withCta,
        withHashtags,
        length,
    ]);

    const loadMyProducts = useCallback(async () => {
        if (hasLoadedMyProducts || isLoadingMyProducts) return;
        setIsLoadingMyProducts(true);
        try {
            // Backend: GET /api/products/seller/me?status=&page=&limit=
            const res = await httpClient.get<{
                data?: unknown[];
            }>("/products/seller/me?limit=30&page=1", { requiresAuth: true });

            const raw = (res as unknown as { data?: any[] }).data ?? [];
            const mapped = raw.map((p) => {
                const images = Array.isArray(p?.images) ? p.images : [];
                const imageUrl =
                    images?.[0]?.imageUrl ?? images?.[0]?.url ?? images?.[0]?.imageUrl ?? null;

                const priceNum =
                    p?.price == null || p.price === ""
                        ? null
                        : Number(p.price);

                return {
                    id: String(p?.id ?? ""),
                    title: String(p?.title ?? ""),
                    description: p?.description != null ? String(p.description) : undefined,
                    price: Number.isFinite(priceNum) ? priceNum : null,
                    imageUrl: imageUrl ? String(imageUrl) : null,
                };
            });

            setMyProducts(mapped.filter((p) => p.id && p.title));
            setHasLoadedMyProducts(true);
        } catch (err) {
            // Không chặn UI; chỉ hiển thị cảnh báo chung nếu cần.
            setErrorMessage(
                err instanceof Error ? err.message : "Không tải được danh sách sản phẩm."
            );
        } finally {
            setIsLoadingMyProducts(false);
        }
    }, [hasLoadedMyProducts, isLoadingMyProducts]);

    useEffect(() => {
        if (!productDropdownOpen) return;
        void loadMyProducts();
    }, [productDropdownOpen, loadMyProducts]);

    useEffect(() => {
        if (canLinkProduct) return;
        setSelectedProduct(null);
        setProductQuery("");
        setProductDropdownOpen(false);
    }, [canLinkProduct]);

    const filteredMyProducts = (() => {
        const q = productQuery.trim().toLowerCase();
        if (!q) return myProducts.slice(0, 8);
        return myProducts
            .filter((p) => p.title.toLowerCase().includes(q))
            .slice(0, 8);
    })();

    const handleSelectProduct = (p: typeof myProducts[number]) => {
        setSelectedProduct(p);
        setProductQuery(p.title);
        setProductDropdownOpen(false);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
                {/* Studio sidebar */}
                <aside
                    className={cn(
                        "flex shrink-0 flex-col border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900",
                        "w-full border-b lg:w-64 lg:border-b-0 lg:border-r",
                    )}
                >
                    <div className="flex items-center gap-3 px-4 py-5 lg:px-4 lg:py-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-50">
                                Content Studio
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">With AI</p>
                        </div>
                    </div>
                    <nav className="flex flex-1 flex-col gap-1 px-2 pb-4 lg:px-3">
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-primary shadow-sm dark:bg-neutral-950"
                        >
                            <Sparkles className="h-5 w-5" />
                            Studio
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Analytics
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <Megaphone className="h-5 w-5" />
                            Campaigns
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <FolderOpen className="h-5 w-5" />
                            Library
                        </button>
                    </nav>
                </aside>

                {/* Main workspace */}
                <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                    {/* Input panel */}
                    <section className="flex w-full flex-col gap-8 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950/40 lg:w-2/5 lg:border-r lg:p-10">
                        <header>
                            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 lg:text-3xl">
                                AI Studio
                            </h2>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Synthesize premium marketing content using advanced AI models tailored for social
                                commerce.
                            </p>
                        </header>

                        <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/80">
                            {(
                                [
                                    { id: "text" as const, label: "Text" },
                                    { id: "image" as const, label: "Image++" },
                                    { id: "video" as const, label: "Video++" },
                                ] as const
                            ).map(({ id, label }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setMode(id)}
                                    className={cn(
                                        "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                                        mode === id
                                            ? "bg-white text-primary shadow-sm dark:bg-neutral-900"
                                            : "font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                Describe your idea
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[160px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-4 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                placeholder="Ví dụ: Tạo bài viết quảng cáo cho đôi giày chạy bộ mới với tone giọng hào hứng"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Tone
                                </label>
                                <select
                                    value={toneMode === "preset" ? tonePreset : "custom"}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === "custom") {
                                            setToneMode("custom");
                                            return;
                                        }
                                        setToneMode("preset");
                                        setTonePreset(v as (typeof TONES)[number]);
                                    }}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {TONES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                    <option value="custom">Tự nhập tone</option>
                                </select>
                                {toneMode === "custom" ? (
                                    <input
                                        value={toneCustom}
                                        onChange={(e) => setToneCustom(e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-4 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Ví dụ: Hào hứng nhưng tinh tế"
                                    />
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Length
                                </label>
                                <select
                                    value={length}
                                    onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {LENGTHS.map((l) => (
                                        <option key={l} value={l}>
                                            {lengthOptionLabel(l)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <label className="group flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={withHashtags}
                                    onChange={(e) => setWithHashtags(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                                />
                                <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                                    Hashtags
                                </span>
                            </label>
                            <label className="group flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={withCta}
                                    onChange={(e) => setWithCta(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                                />
                                <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                                    Call-to-Action
                                </span>
                            </label>
                        </div>

                        {canLinkProduct ? (
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Linked Product
                                </span>
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-400">
                                    SMART SYNC
                                </span>
                            </div>
                            <div className="relative" ref={productWrapRef}>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={productQuery}
                                    onChange={(e) => {
                                        setProductQuery(e.target.value);
                                        setSelectedProduct(null);
                                        setProductDropdownOpen(true);
                                    }}
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    placeholder="Search product catalogue..."
                                    onFocus={() => setProductDropdownOpen(true)}
                                    onBlur={() => {
                                        window.setTimeout(() => {
                                            const active = document.activeElement;
                                            if (
                                                productWrapRef.current &&
                                                active &&
                                                productWrapRef.current.contains(active)
                                            ) {
                                                return;
                                            }
                                            setProductDropdownOpen(false);
                                        }, 150);
                                    }}
                                />
                                {productDropdownOpen ? (
                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
                                        {isLoadingMyProducts ? (
                                            <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                Đang tải sản phẩm...
                                            </div>
                                        ) : filteredMyProducts.length ? (
                                            filteredMyProducts.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                                    onMouseDown={(e) => {
                                                        // Ngăn onBlur đóng trước khi select.
                                                        e.preventDefault();
                                                    }}
                                                    onClick={() => handleSelectProduct(p)}
                                                >
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                                                        {p.title}
                                                    </span>
                                                    {p.price != null ? (
                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            Giá: {p.price}
                                                        </span>
                                                    ) : null}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                Không tìm thấy sản phẩm phù hợp.
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        ) : null}

                        <Button
                            type="button"
                            size="lg"
                            className="mt-auto w-full gap-3 text-lg font-bold shadow-lg shadow-primary/20"
                            disabled={isGenerating}
                            onClick={handleGenerate}
                        >
                            <Wand2 className={cn("h-5 w-5", isGenerating && "animate-pulse")} />
                            {isGenerating ? "Đang tạo..." : "Tạo nội dung"}
                        </Button>
                    </section>

                    {/* Output panel */}
                    <section className="relative flex w-full flex-1 flex-col gap-6 overflow-hidden bg-white p-6 dark:bg-neutral-950 lg:w-3/5 lg:p-10">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />

                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 lg:text-2xl">
                                Soạn và chỉnh sửa bài đăng
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 font-semibold"
                                    onClick={handleGenerate}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Tạo lại
                                </Button>
                            </div>
                        </div>

                        <div className="relative z-10 flex min-h-[280px] flex-1 flex-col rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 lg:p-8">
                            <div className="flex min-h-0 flex-1 flex-col gap-4">
                                <AiLabRichOutput
                                    generated={generated}
                                    outputRevision={outputRevision}
                                    editorResetNonce={editorResetNonce}
                                    withHashtags={withHashtags}
                                    withCta={withCta}
                                    length={length}
                                    onPlainTextChange={onEditorPlainTextChange}
                                    onHtmlChange={onEditorHtmlChange}
                                />

                                {mode === "image" && generatedImage?.data ? (
                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                            Ảnh AI
                                        </p>
                                        <img
                                            alt="AI generated image"
                                            className="max-h-80 w-auto rounded-xl border border-neutral-200 object-contain dark:border-neutral-800"
                                            src={`data:${
                                                generatedImage.mimeType || "image/jpeg"
                                            };base64,${generatedImage.data}`}
                                        />
                                    </div>
                                ) : null}

                                {generated && mode === "video" ? (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {generated?.videoStatus === "unavailable"
                                            ? generated?.message ?? "Video generation hiện chưa khả dụng."
                                            : "Đã có kết quả video."}
                                    </p>
                                ) : null}

                                {generated ? (
                                    <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Mode: {mode} · Tone: {displayTone} · Length: {length} · Status:{" "}
                                            {generated?.status ?? "—"}
                                        </p>
                                        {typeof textWeightedScore === "number" ? (
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                Text score: {textWeightedScore.toFixed(1)}
                                            </p>
                                        ) : null}
                                        {mode === "image" && typeof imageWeightedScore === "number" ? (
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                Image score: {imageWeightedScore.toFixed(1)}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            {errorMessage ? (
                                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>

                        <div className="relative z-10 flex flex-col items-stretch justify-end gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "h-12 gap-2 px-5 font-bold",
                                    !hasPostableContent && "pointer-events-none opacity-50",
                                )}
                                disabled={!hasPostableContent || postActionBusy}
                                onClick={openScheduleModal}
                            >
                                <Calendar className="h-5 w-5" />
                                Lên lịch đăng
                            </Button>
                            <Button
                                type="button"
                                className="h-12 gap-2 px-6 font-bold shadow-lg shadow-primary/20"
                                disabled={!hasPostableContent || postActionBusy}
                                onClick={() => void handlePublishNow()}
                            >
                                {postActionBusy ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-5 w-5" />
                                )}
                                Đăng ngay
                            </Button>
                        </div>
                    </section>
                </div>
            </div>

            {scheduleModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div
                        role="presentation"
                        className="absolute inset-0"
                        onClick={() => !postActionBusy && setScheduleModalOpen(false)}
                        aria-hidden
                    />
                    <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-background-light shadow-2xl dark:border-neutral-800 dark:bg-background-dark sm:rounded-xl">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                disabled={postActionBusy}
                                onClick={() => setScheduleModalOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <h2 className="text-lg font-semibold">Lên lịch đăng</h2>
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-full px-5"
                                disabled={postActionBusy || !scheduledAt}
                                onClick={() => void handleConfirmSchedule()}
                            >
                                {postActionBusy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Xác nhận"
                                )}
                            </Button>
                        </div>
                        <div ref={schedulePanelRef} className="space-y-3 overflow-y-auto px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                                Chọn ngày và giờ đăng bài (giống khi tạo bài trên Feed).
                            </div>
                            <label className="block text-center text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                                Ngày &amp; giờ
                            </label>
                            <div className="flex w-full justify-center">
                                <div className="inline-flex max-w-full rounded-xl border border-neutral-200 bg-card p-3 text-card-foreground dark:border-neutral-700">
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
                                    htmlFor="ai-lab-schedule-time"
                                    className="shrink-0 text-sm font-medium text-neutral-900 dark:text-neutral-50"
                                >
                                    Giờ
                                </label>
                                <input
                                    id="ai-lab-schedule-time"
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="h-10 w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:max-w-48"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {successModal !== "none" ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-background-light p-6 text-center shadow-2xl dark:border-neutral-800 dark:bg-background-dark">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <p className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                            {successModal === "scheduled"
                                ? "Đã lên lịch đăng thành công."
                                : "Đã đăng bài thành công."}
                        </p>
                        <Button
                            type="button"
                            className="w-full font-semibold"
                            onClick={() => setSuccessModal("none")}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
