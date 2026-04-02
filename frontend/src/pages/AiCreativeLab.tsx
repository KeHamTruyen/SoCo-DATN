import {
    BarChart3,
    Bold,
    Calendar,
    CheckCircle,
    Copy,
    FolderOpen,
    Image as ImageIcon,
    Italic,
    List,
    Megaphone,
    Plus,
    RefreshCw,
    Search,
    Smile,
    Sparkles,
    Wand2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, UnifiedHeader } from "../shared/ui";
import { cn } from "../shared/lib/cn";
import { aiApi } from "../features/ai/api/aiApi";
import { httpClient } from "../shared/api/httpClient";

type StudioMode = "text" | "image" | "video";

const TONES = ["Excited", "Professional", "Fun", "Friendly"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

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
    const outputRef = useRef<HTMLDivElement>(null);
    const productWrapRef = useRef<HTMLDivElement>(null);

    const truncateWords = (text: string, maxWords: number) => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ").trim();
    };

    const lengthMeta =
        length === "Short"
            ? { min: 100, max: 140, hashtagMax: 5 }
            : length === "Medium"
              ? { min: 140, max: 220, hashtagMax: 8 }
              : { min: 220, max: 300, hashtagMax: 10 };
    const wordMax = lengthMeta.max;
    const effectiveTone =
        toneMode === "preset" ? tonePreset : toneCustom.trim();
    const displayTone =
        toneMode === "preset" ? tonePreset : toneCustom.trim() || "—";

    const lengthOptionLabel = (l: (typeof LENGTHS)[number]) => {
        if (l === "Short") return "Short (100-140 chữ)";
        if (l === "Medium") return "Medium (140-220 chữ)";
        return "Long (220-300 chữ)";
    };

    const generatedText = generated?.generatedText ?? null;
    const generatedImage = generated?.generatedImage ?? null;

    const displayBody = generatedText?.body
        ? truncateWords(String(generatedText.body), wordMax)
        : "";
    const displayHashtags =
        withHashtags && Array.isArray(generatedText?.hashtags)
            ? generatedText.hashtags.slice(0, lengthMeta.hashtagMax).join(" ")
            : "";

    const textWeightedScore =
        generated?.evaluationScores?.weightedScore ??
        generated?.textScores?.weightedScore;
    const imageWeightedScore = generated?.imageScores?.weightedScore;

    const handleGenerate = useCallback(async () => {
        if (isGenerating) return;
        setErrorMessage(null);
        setGenerated(null);

        const idea = prompt.trim();
        const productAttachment = selectedProduct
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
            : productQuery.trim()
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

    const handleCopy = useCallback(async () => {
        const text = outputRef.current?.innerText ?? "";
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            /* ignore */
        }
    }, []);

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
                    <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200/80 px-2 pb-6 pt-4 dark:border-neutral-800">
                        <Button type="button" className="mx-1 gap-2 font-semibold">
                            <Plus className="h-4 w-4" />
                            Create New
                        </Button>
                    </div>
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
                                Kết quả được tạo bởi AI
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
                                <Button type="button" variant="outline" size="sm" className="gap-2 font-semibold" onClick={handleCopy}>
                                    <Copy className="h-4 w-4" />
                                    Sao chép
                                </Button>
                            </div>
                        </div>

                        <div className="relative z-10 flex min-h-[280px] flex-1 flex-col rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 lg:p-8">
                            <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-700">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Bold className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Italic className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div
                                ref={outputRef}
                                className="flex-1 text-base leading-relaxed text-neutral-900 outline-none dark:text-neutral-100"
                            >
                                {!generated ? (
                                    <>
                                        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            Nhập ý tưởng ở bên trái rồi bấm{" "}
                                            <strong className="text-neutral-900 dark:text-neutral-50">Tạo nội dung</strong>.
                                        </p>
                                        {prompt.trim() || productQuery.trim() ? (
                                            <p className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                                {prompt.trim() ? (
                                                    <>
                                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                                            Ý tưởng:
                                                        </span>{" "}
                                                        {prompt}
                                                        <span className="mt-1 block text-xs">
                                                            Mode: {mode} · Tone:{" "}
                                                            {displayTone} · Length:{" "}
                                                            {length}
                                                        </span>
                                                    </>
                                                ) : null}
                                                {productQuery.trim() ? (
                                                    <span className="mt-2 block">
                                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                                            Sản phẩm:
                                                        </span>{" "}
                                                        {productQuery}
                                                    </span>
                                                ) : null}
                                            </p>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        {generatedText?.title ? (
                                            <p className="mb-3 text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                                                {generatedText.title}
                                            </p>
                                        ) : null}

                                        {displayBody ? (
                                            <p className="mb-4 whitespace-pre-wrap">{displayBody}</p>
                                        ) : null}

                                        {withCta && generatedText?.callToAction ? (
                                            <p className="mb-4 font-semibold text-primary">
                                                {generatedText.callToAction}
                                            </p>
                                        ) : null}

                                        {withHashtags && displayHashtags ? (
                                            <p className="mb-4 italic text-neutral-600 dark:text-neutral-400">
                                                {displayHashtags}
                                            </p>
                                        ) : null}

                                        {mode === "image" && generatedImage?.data ? (
                                            <img
                                                alt="AI generated image"
                                                className="mb-4 max-h-80 w-auto rounded-xl border border-neutral-200 object-contain dark:border-neutral-800"
                                                src={`data:${
                                                    generatedImage.mimeType || "image/jpeg"
                                                };base64,${generatedImage.data}`}
                                            />
                                        ) : null}

                                        {mode === "video" ? (
                                            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                {generated?.videoStatus === "unavailable"
                                                    ? generated?.message ??
                                                      "Video generation hiện chưa khả dụng."
                                                    : "Đã có kết quả video."}
                                            </p>
                                        ) : null}

                                        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            Mode: {mode} · Tone:{" "}
                                            {displayTone} · Length:{" "}
                                            {length} · Status:{" "}
                                            {generated?.status ?? "—"}
                                        </p>
                                        {typeof textWeightedScore === "number" ? (
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                Text score: {textWeightedScore.toFixed(1)}
                                            </p>
                                        ) : null}
                                        {mode === "image" &&
                                        typeof imageWeightedScore === "number" ? (
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                Image score: {imageWeightedScore.toFixed(1)}
                                            </p>
                                        ) : null}
                                    </>
                                )}
                            </div>

                            {errorMessage ? (
                                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>

                        <div className="relative z-10 flex flex-col items-stretch justify-end gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                            <Link
                                to="/scheduled-posts"
                                className={cn(
                                    "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 font-bold text-neutral-800 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
                                )}
                            >
                                <Calendar className="h-5 w-5" />
                                Lên lịch đăng
                            </Link>
                            <Link
                                to="/feed"
                                className={cn(
                                    "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700 active:scale-[0.98]",
                                )}
                            >
                                <CheckCircle className="h-5 w-5" />
                                Đăng ngay
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
